import { SubmitData } from "./typings";
import { uuid } from "./utils";

type Resolve = (url: string) => void;
type Reject = (error: Error) => void;

export class FinteqHubProcessing {
  private apiUrl: string;
  private fingerprintVisitorId: string;
  private merchantId: string;
  private sessionId: string;

  constructor(
    apiUrl: string,
    fingerprintVisitorId: string,
    merchantId: string,
    sessionId: string
  ) {
    this.apiUrl = apiUrl;
    this.fingerprintVisitorId = fingerprintVisitorId;
    this.merchantId = merchantId;
    this.sessionId = sessionId;
  }

  public submitForm(data: SubmitData) {
    const promise = new Promise((resolve: Resolve, reject: Reject) => {
      this.sendPost(`${this.apiUrl}/v2/transactions/submit-form`, data)
        .then((response) => {
          if (response.status === 200) {
            response.json().then((result) => {
              if (result.error) {
                reject(new Error(result.error));
              } else {
                this.processOperation(
                  `${this.apiUrl}/v1/operations/${result.operationId}`,
                  resolve,
                  reject
                );
              }
            });
          } else {
            response
              .json()
              .then((result) => reject(new Error(result.error)))
              .catch((error) => reject(error));
          }
        })
        .catch((error) => reject(error));
    });

    return promise;
  }

  private processOperation(url: string, resolve: Resolve, reject: Reject) {
    this.sendPost(url, {})
      .then((response) => {
        if (response.status === 200) {
          response.json().then((result) => {
            if (result.type === "redirect") {
              resolve(result.redirectUrl);
            } else if (result.type === "submitForm") {
              let iframe: HTMLIFrameElement | null =
                document.createElement("iframe");

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
          });
        } else {
          response
            .json()
            .then((result) => reject(new Error(result.error)))
            .catch((error) => reject(error));
        }
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
        "x-project-id": "017cdbcb-ca22-68f1-95a9-edb698dd063c", // todo: fix it
      },
      body: JSON.stringify(data),
    });
  }
}
