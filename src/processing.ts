import { ProcessOperationRedirectResponse, ProcessOperationResponse, SessionResponse, SubmitData } from "./typings";
import { uuid } from "./utils";

type ResolveSubmitForm = (result: ProcessOperationRedirectResponse) => void;
type ResolveSession = (result: SessionResponse) => void;
type Reject = (error: Error) => void;

export class FinteqHubProcessing {
  private apiUrl: string;
  private fingerprintVisitorId: string;
  private merchantId: string;
  private sessionId: string;

  constructor(apiUrl: string, fingerprintVisitorId: string, merchantId: string, sessionId: string) {
    this.apiUrl = apiUrl;
    this.fingerprintVisitorId = fingerprintVisitorId;
    this.merchantId = merchantId;
    this.sessionId = sessionId;
  }

  public getSession() {
    const promise = new Promise((resolve: ResolveSession, reject: Reject) => {
      fetch(`${this.apiUrl}/v1/sessions/${this.sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "x-merchant-id": this.merchantId,
        },
      })
        .then((response) => {
          response
            .json()
            .then((result) => {
              if (result.error || response.status !== 200) {
                reject(new Error(result.error));
              } else {
                resolve(result);
              }
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });

    return promise;
  }

  public submitForm(data: SubmitData) {
    const promise = new Promise((resolve: ResolveSubmitForm, reject: Reject) => {
      this.sendPost(`${this.apiUrl}/v2/transactions/submit-form`, data)
        .then((response) => {
          response
            .json()
            .then((result) => {
              if (result.error || response.status !== 200) {
                reject(new Error(result.error));
              } else {
                this.processOperation(`${this.apiUrl}/v1/operations/${result.operationId}`, resolve, reject);
              }
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });

    return promise;
  }

  private processOperation(url: string, resolve: ResolveSubmitForm, reject: Reject) {
    this.sendPost(url, {})
      .then((response) => {
        response
          .json()
          .then((result: ProcessOperationResponse) => {
            if (response.status === 200) {
              if (result.type === "redirect") {
                resolve(result);
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
              reject(new Error((result as undefined as { error: string }).error));
            }
          })
          .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
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
      },
      body: JSON.stringify(data),
    });
  }
}
