import {
  ProcessOperationRedirectResponse,
  ProcessOperationResponse,
  SessionResponse,
  SubmitData,
} from "./typings";
import { getDeviceData, uuid } from "./utils";

type ResolveSubmitForm = (result: ProcessOperationRedirectResponse) => void;
type ResolveSession = (result: SessionResponse) => void;
type Reject = (error: Error) => void;

export class FinteqHubProcessing {
  private apiUrl: string;
  private fingerprintVisitorId: string;
  private merchantId: string;
  private sessionId: string;
  private projectId: string;

  constructor(apiUrl: string, fingerprintVisitorId: string, merchantId: string, sessionId: string) {
    this.apiUrl = apiUrl;
    this.fingerprintVisitorId = fingerprintVisitorId;
    this.merchantId = merchantId;
    this.sessionId = sessionId;
  }

  public getSession() {
    return new Promise(async (resolve: ResolveSession, reject: Reject) => {
      try {
        const response = await fetch(`${this.apiUrl}/v1/sessions/${this.sessionId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "x-merchant-id": this.merchantId,
            "x-request-id": uuid(),
          },
        });
        const result = await response.json();

        if (result.error || response.status !== 200) {
          reject(new Error(result.error));
        } else {
          this.projectId = (result as SessionResponse).operation?.projectId;
          resolve(result);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  public submitForm(data: SubmitData) {
    return new Promise(async (resolve: ResolveSubmitForm, reject: Reject) => {
      try {
        const response = await this.sendPost(`${this.apiUrl}/v1/transactions/submit-form`, {
          session: {
            fingerprint: this.fingerprintVisitorId,
            ...getDeviceData(),
          },
          ...data,
        });
        const result = await response.json();

        if (result.error || response.status !== 200) {
          reject(new Error(result.error));
        } else {
          this.processOperation(
            `${this.apiUrl}/v1/operations/${result.operationId}`,
            resolve,
            reject
          );
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  private async processOperation(url: string, resolve: ResolveSubmitForm, reject: Reject) {
    try {
      const response = await this.sendPost(url, {});
      const result: ProcessOperationResponse = await response.json();

      if (response.status === 200) {
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
      } else {
        reject(new Error((result as unknown as { error: string }).error));
      }
    } catch (e) {
      reject(e);
    }
  }

  private sendPost(url: string, data: {}) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "x-merchant-id": this.merchantId,
        "x-request-id": uuid(),
        "x-fingerprint": this.fingerprintVisitorId,
        "x-session-id": this.sessionId,
        "x-project-id": this.projectId,
      },
      body: JSON.stringify(data),
    });
  }
}
