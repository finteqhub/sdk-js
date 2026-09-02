# processing-sdk

Use `new FinteqHubProcessing(options: ProcessingOptions)` to create an instance of the FinteqHubProcessing object. The FinteqHubProcessing object is your entrypoint to FinteqHub processing SDK.

```
interface ProcessingOptions {
  apiUrl: string;
  fingerprintVisitorId: string;
  merchantId: string;
  sessionId: string;
  isSecure?: boolean; // default false
  retryOptions?: RetryOptions;
}

const processing = new FinteqHubProcessing({
  apiUrl: 'api-url',
  fingerprintVisitorId: 'fingerprint-visitor-id',
  merchantId: 'merchant-id',
  sessionId: 'session-id',
});
```

## Retries and error diagnostics

Failed HTTP requests are retried automatically with exponential backoff (`100ms → 200ms → 500ms → 1000ms → 2000ms`). Retries can be configured via the `retryOptions` constructor option:

```
interface RetryOptions {
  retryCount?: number; // number of retries after the initial attempt, default 5; 0 disables retries
  retryStatusCode?: (statusCode: number) => boolean; // default: statusCode < 200 || statusCode === 400 || statusCode === 408 || statusCode >= 500
}
```

Network errors (the browser could not reach the server at all, e.g. `TypeError: Failed to fetch`, or the connection dropped while the response body was being read) are always retried too.

Every retry attempt is reported with `console.warn`. When a request finally fails, the SDK logs `console.error` with a full diagnostic dump and rejects with a `RequestError` whose `diagnostics` field carries the same payload — include it in your error reporting. `diagnostics.kind` tells the failure class apart:

- `"network"` — the browser never got a complete response (e.g. `TypeError: Failed to fetch`, or the body could not be read); `diagnostics.error` describes the thrown error, `diagnostics.response.status` is present when headers had arrived before the failure, `message` is `request to <url> failed after N attempt(s): ...`;
- `"http_error"` — an error response (non-200 status, or an `error` field in the body); `message` is the error text from the response body (or `unexpected response status <code>` when the body has none), `diagnostics.response.status` carries the HTTP status;
- `"invalid_json"` — the response body is not valid JSON; both `diagnostics.error` (the parse error; its message follows the same policy as the body — sanitized for non-200, omitted for 200 responses) and `diagnostics.response` are set.

Every `diagnostics` payload also includes:

- `sdkVersion`;
- `request`: url, method, `x-request-id`, session id, and per-attempt log `attempts: [{ durationMs, status?, error? }]` — attempt durations help tell an instant failure (DNS/connection refused) from a hang (timeout/handshake);
- `response.body` for non-200 responses — truncated to 500 chars with long digit runs masked (`***`); the body of a 200 response is never included since it may carry session credentials; the request body is never included anywhere;
- `environment`: `navigator.onLine`, `document.visibilityState`, `navigator.connection` (`effectiveType`/`rtt`/`downlink`, Chromium only), timestamp.

Diagnostics are collected regardless of whether retries are enabled.

## SDK identification header

Every request the SDK makes carries an extra header:

```
X-Finteqhub-SDK: sdk-js/<version>
```

The value contains the SDK name and version (kept in sync with `package.json` by a test) — for example `sdk-js/0.11.0`. FinteqHub uses this header to identify traffic coming from the official SDK integration — for example to notify affected merchants when a security fix is released. It does not affect authentication or request routing.

The header is added automatically to every request and cannot be disabled.

## API

### processing.getSession()

Use `processing.getSession` to get session information.

```
processing
  .getSession()
  .then(result => console.log(result))
  .catch(error => console.warn(error));
```

### processing.submitForm(data)

Use `processing.submitForm` to submit transaction. When called, `processing.submitForm` will attempt to complete any required actions to process the transaction. This method returns promise which resolves with response (`{ "type": "redirect", "redirectUrl": string}`) or error that describes the failure.

```
processing
  .submitForm(data)
  .then(result => console.log(result))
  .catch(error => console.warn(error));
```

## Usage

```
import { FinteqHubProcessing } from "@finteqhub/sdk-js";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const fp = await FingerprintJS.load();
const result = await fp.get();

const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId: result.visitorId, merchantId, sessionId });
const session = await processing.getSession();

const data = {/** collect data from form and session **/}

processing
  .submitForm(data)
  .then(result => console.log(result))
  .catch(error => console.warn(error));
```

## Releasing

On every version bump update **both** `package.json` `version` and `SDK_VERSION` in `src/version.ts` — they must stay in sync so the `X-Finteqhub-SDK` header reports the right version. `src/version.test.ts` fails CI if they drift (`node scripts/sync-version.js` updates `src/version.ts` from `package.json`). Describe the release in [CHANGELOG.md](CHANGELOG.md), including migration notes for breaking changes.

### Beta releases

To try changes before bumping the version, run the `publish-beta` workflow (GitHub → Actions → publish-beta → Run workflow, pick your branch). It publishes `<current version>-beta.<run number>` to npm under the `beta` dist-tag — `latest` and the version in the repo stay untouched. Install it with:

```
npm i @finteqhub/sdk-js@beta
```

or pin the exact version printed in the workflow summary.
