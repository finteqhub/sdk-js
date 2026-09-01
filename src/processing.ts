import {
  ProcessOperationRedirectResponse,
  ProcessOperationResponse,
  SessionResponse,
  SubmitData,
} from "./typings";
import { getDeviceData, uuid } from "./utils";
import { SDK_HEADER_NAME, SDK_HEADER_VALUE, SDK_VERSION } from "./version";

type ResolveSubmitForm = (result: ProcessOperationRedirectResponse) => void;
type ResolveSession = (result: SessionResponse) => void;
type Reject = (error: Error) => void;

type RequestOptions = {
  method: string;
  headers: Record<string, string>;
  body?: string;
};

export interface RetryOptions {
  retryCount?: number;
  retryStatusCode?: (statusCode: number) => boolean;
}

export interface ProcessingOptions {
  apiUrl: string;
  fingerprintVisitorId: string;
  merchantId: string;
  sessionId: string;
  isSecure?: boolean;
  retryOptions?: RetryOptions;
}

export type RequestAttempt = {
  durationMs: number;
  status?: number; // present when the server responded
  error?: string; // present when the attempt threw (network failure)
};

export type RequestDiagnostics = {
  kind: "network" | "http_error" | "invalid_json";
  sdkVersion: string;
  // present when a JS error was thrown (network failure, invalid JSON in the response body)
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
  // present when the server responded; body is truncated, digit runs are masked,
  // and it is never included for 200 responses (may carry session credentials)
  response?: {
    status: number;
    body?: string;
  };
  request: {
    url: string;
    method: string;
    requestId: string;
    sessionId: string;
    attempts: RequestAttempt[];
  };
  environment: {
    online: boolean;
    visibility: string;
    connection?: {
      effectiveType?: string;
      rtt?: number;
      downlink?: number;
    };
    timestamp: string;
  };
};

export class RequestError extends Error {
  public diagnostics: RequestDiagnostics;

  constructor(message: string, diagnostics: RequestDiagnostics) {
    super(message);
    this.name = "RequestError";
    this.diagnostics = diagnostics;
  }
}

const DEFAULT_RETRY_COUNT = 5;
const RETRY_DELAYS_MS = [100, 200, 500, 1000, 2000];
const MAX_BODY_SNIPPET_LENGTH = 500;

// masks long digit runs (PANs, phone numbers) before a response body lands in logs
const sanitizeBody = (body: string) => body.slice(0, MAX_BODY_SNIPPET_LENGTH).replace(/\d{6,}/g, "***");

const defaultRetryStatusCode = (statusCode: number) =>
  statusCode < 200 || statusCode === 400 || statusCode === 408 || statusCode >= 500;

const REQUIRED_OPTIONS = ["apiUrl", "fingerprintVisitorId", "merchantId", "sessionId"] as const;

function validateOptions(options: ProcessingOptions) {
  if (typeof options !== "object" || options === null) {
    throw new TypeError(
      "sdk-js: constructor expects an options object: { apiUrl, fingerprintVisitorId, merchantId, sessionId, isSecure?, retryOptions? }"
    );
  }
  for (const key of REQUIRED_OPTIONS) {
    if (typeof options[key] !== "string" || options[key] === "") {
      throw new TypeError(`sdk-js: option "${key}" must be a non-empty string`);
    }
  }
  if (options.isSecure !== undefined && typeof options.isSecure !== "boolean") {
    throw new TypeError('sdk-js: option "isSecure" must be a boolean');
  }
  if (options.retryOptions !== undefined) {
    if (typeof options.retryOptions !== "object" || options.retryOptions === null) {
      throw new TypeError('sdk-js: option "retryOptions" must be an object');
    }
    const { retryCount, retryStatusCode } = options.retryOptions;
    if (retryCount !== undefined && (!Number.isInteger(retryCount) || retryCount < 0)) {
      throw new TypeError('sdk-js: option "retryOptions.retryCount" must be a non-negative integer');
    }
    if (retryStatusCode !== undefined && typeof retryStatusCode !== "function") {
      throw new TypeError('sdk-js: option "retryOptions.retryStatusCode" must be a function');
    }
  }
}

export class FinteqHubProcessing {
  private apiUrl: string;
  private fingerprintVisitorId: string;
  private merchantId: string;
  private sessionId: string;
  private projectId: string;
  private isSecure: boolean;
  private retryOptions: RetryOptions;

  constructor(options: ProcessingOptions) {
    validateOptions(options);

    this.apiUrl = options.apiUrl;
    this.fingerprintVisitorId = options.fingerprintVisitorId;
    this.merchantId = options.merchantId;
    this.sessionId = options.sessionId;
    this.isSecure = options.isSecure ?? false;
    this.retryOptions = options.retryOptions ?? {};
  }

  public getSession() {
    return new Promise(async (resolve: ResolveSession, reject: Reject) => {
      try {
        const url = this.isSecure ? `${this.apiUrl}/v1/secure/sessions/${this.sessionId}` : `${this.apiUrl}/v1/sessions/${this.sessionId}`;

        const result = await this.request(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "x-merchant-id": this.merchantId,
            "x-request-id": uuid(),
            [SDK_HEADER_NAME]: SDK_HEADER_VALUE,
          },
        });

        this.projectId = (result as SessionResponse).operation?.projectId;
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  public submitForm(data: SubmitData) {
    return new Promise(async (resolve: ResolveSubmitForm, reject: Reject) => {
      try {
        const url = this.isSecure ? `${this.apiUrl}/v1/secure/transactions/submit-form` : `${this.apiUrl}/v1/transactions/submit-form`;
        const result = await this.sendPost(url, {
          session: {
            fingerprint: this.fingerprintVisitorId,
            ...getDeviceData(),
          },
          ...data,
        });

        const operationUrl = this.isSecure ? `${this.apiUrl}/v1/secure/operations/${result.operationId}` : `${this.apiUrl}/v1/operations/${result.operationId}`;
        this.processOperation(
          operationUrl,
          resolve,
          reject
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  private async processOperation(url: string, resolve: ResolveSubmitForm, reject: Reject) {
    try {
      const result: ProcessOperationResponse = await this.sendPost(url, {});

      if (result.type === "redirect") {
        resolve(result);
      } else if (result.type === "wait") {
        setTimeout(() => {
          this.processOperation(url, resolve, reject);
        }, result.waitInterval * 1000 || 10000);
      } else if (result.type === "submitForm") {
        let iframe: HTMLIFrameElement | null = document.createElement("iframe");

        iframe.src = result.formUrl;
        iframe.style.display = "none";

        document.body.appendChild(iframe);

        iframe.onload = () => {
          this.processOperation(url, resolve, reject);
          if (iframe) {
            document.body.removeChild(iframe);
            iframe = null;
          }
        };
      } else {
        reject(new Error("unknown process operation type"));
      }
    } catch (e) {
      reject(e);
    }
  }

  private sendPost(url: string, data: {}) {
    return this.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "x-merchant-id": this.merchantId,
        "x-request-id": uuid(),
        "x-fingerprint": this.fingerprintVisitorId,
        "x-session-id": this.sessionId,
        "x-project-id": this.projectId,
        [SDK_HEADER_NAME]: SDK_HEADER_VALUE,
      },
      body: JSON.stringify(data),
    });
  }

  private async request(url: string, options: RequestOptions) {
    const { response, text, attempts } = await this.fetchWithRetry(url, options);
    const body = response.status !== 200 ? sanitizeBody(text) : undefined;

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw this.responseError(
        "invalid_json",
        `request to ${url} returned invalid JSON (status ${response.status}): ${e.message}`,
        url, options, attempts, response, body, e
      );
    }

    if (result?.error || response.status !== 200) {
      throw this.responseError(
        "http_error",
        result?.error || `unexpected response status ${response.status}`,
        url, options, attempts, response, body
      );
    }

    return result;
  }

  private async fetchWithRetry(url: string, options: RequestOptions): Promise<{ response: Response; text: string; attempts: RequestAttempt[] }> {
    const retryCount = this.retryOptions.retryCount ?? DEFAULT_RETRY_COUNT;
    const retryStatusCode = this.retryOptions.retryStatusCode ?? defaultRetryStatusCode;
    const attempts: RequestAttempt[] = [];

    for (let attempt = 1; ; attempt += 1) {
      let reason: string;
      let result: { response: Response; text: string } | undefined;
      const startedAt = Date.now();

      try {
        const response = await fetch(url, options);
        // the connection can also drop while the body is being read — that is a network failure too
        const text = await response.text();
        result = { response, text };
        attempts.push({ durationMs: Date.now() - startedAt, status: response.status });
      } catch (e) {
        attempts.push({ durationMs: Date.now() - startedAt, error: e.message });

        if (attempt > retryCount) {
          const diagnostics = this.collectDiagnostics("network", url, options, attempts, e);
          console.error("sdk-js: request failed", diagnostics);
          throw new RequestError(`request to ${url} failed after ${attempt} attempt(s): ${e.message}`, diagnostics);
        }
        reason = e.message;
      }

      // retryStatusCode is user code — called outside the try so its errors are not
      // recorded as a network failure of the attempt
      if (result) {
        if (!retryStatusCode(result.response.status) || attempt > retryCount) {
          return { ...result, attempts };
        }
        reason = `status code ${result.response.status}`;
      }

      const delay = RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
      console.warn(`sdk-js: request to ${url} failed (${reason}), retry ${attempt}/${retryCount} in ${delay}ms`, {
        requestId: options.headers["x-request-id"],
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  private responseError(
    kind: RequestDiagnostics["kind"],
    message: string,
    url: string,
    options: RequestOptions,
    attempts: RequestAttempt[],
    response: Response,
    body?: string,
    error?: Error
  ) {
    const diagnostics = this.collectDiagnostics(kind, url, options, attempts, error, response, body);
    console.error("sdk-js: request failed", diagnostics);
    return new RequestError(message, diagnostics);
  }

  private collectDiagnostics(
    kind: RequestDiagnostics["kind"],
    url: string,
    options: RequestOptions,
    attempts: RequestAttempt[],
    error?: Error,
    response?: Response,
    body?: string
  ): RequestDiagnostics {
    const connection = (navigator as { connection?: { effectiveType?: string; rtt?: number; downlink?: number } }).connection;

    return {
      kind,
      sdkVersion: SDK_VERSION,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: (error as { cause?: unknown }).cause,
          }
        : undefined,
      response: response ? { status: response.status, body } : undefined,
      request: {
        url,
        method: options.method,
        requestId: options.headers["x-request-id"],
        sessionId: this.sessionId,
        attempts,
      },
      environment: {
        online: navigator.onLine,
        visibility: document.visibilityState,
        connection: connection
          ? { effectiveType: connection.effectiveType, rtt: connection.rtt, downlink: connection.downlink }
          : undefined,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
