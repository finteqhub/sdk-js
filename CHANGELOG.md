# Changelog

Notable changes to `@finteqhub/sdk-js`. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.17.0

### Breaking changes

- The SDK class is now exported as `Processing`; the previous class name is no longer exported.
- The constructor takes a single options object instead of positional arguments. The object is validated like the positional arguments were; passing positional arguments throws `TypeError: sdk-js: constructor expects an options object`. The new `ProcessingOptions` type is exported.

Migration:

```
// 0.16.0: positional arguments
(apiUrl, fingerprintVisitorId, sessionId, isSecure, retryOptions)

// 0.17.0: an options object
new Processing({ apiUrl, fingerprintVisitorId, sessionId, isSecure, retryOptions });
```

`isSecure` and `retryOptions` stay optional, with the same defaults (`false` and `{}`).

## 0.16.0

### Breaking changes

- The SDK no longer sends the `x-merchant-id` header (previously on every request) or the `x-project-id` header (previously on `submit-form` and `operations` requests, taken from the session response). This release requires a backend that no longer expects these headers; against older backends `submit-form` and `sessions` requests are rejected with 400.
- The `merchantId` constructor argument was removed together with the header. The constructor arguments are now `(apiUrl, fingerprintVisitorId, sessionId, isSecure?, retryOptions?)` — every argument after `fingerprintVisitorId` shifts one position to the left. Callers must drop the third argument; a call site that still passes it fails argument validation (`isSecure` receives the session id, which is not a boolean, and the constructor throws a `TypeError`).

### Changed

- README: `getSession` is documented as optional and the Usage section shows a submit-only flow next to the render-from-session one. `submitForm` never depended on the session response apart from `projectId`, which is no longer sent.

## 0.15.0

### Added

- Form submissions include `session.device.browser.clientHints` when `navigator.userAgentData` is available, for both regular and secure endpoints. The SDK forwards native browser keys and values, including the high-entropy device model, for backend device-brand detection; it does not send a device brand itself.
- If high-entropy values are unavailable or rejected, the SDK sends the available low-entropy `brands`, `mobile` and `platform` values. Browsers without the API omit `clientHints` entirely. The public SDK API is unchanged.

## 0.14.0

### Breaking changes

- `transactionType` was removed from the `SubmitData` type. It was declared on two of the three variants (the saved-card variant with `customerAccountId` and the generic `Record<string, string>` one) but never read by the SDK: `submitForm` spreads the data straight into the request body. TypeScript callers that pass `transactionType` in an object literal now hit the excess property check and need to drop it; JavaScript callers are unaffected, since the spread still forwards whatever the caller supplies.

`transactionType` is unchanged on `OperationSession`, where the API returns it as part of the session. `TxType` is also unchanged: it is unused inside the SDK, but it is re-exported from the package root and stays part of the public API.

## 0.13.1

### Changed

- `CHANGELOG.md` is now included in the published npm package (previously only `dist/` and `README.md` shipped).
- Added `repository`, `homepage` and `bugs` fields to `package.json`, so the npm page links to the GitHub repository, relative links in the README resolve there, and dependency bots can find the release notes.

No code changes: the SDK behaves exactly as in 0.13.0 (only the version reported in the `x-pgw-sdk` header differs).

## 0.13.0

### Breaking changes

- The SDK identification header sent with every request was renamed from `X-Finteqhub-SDK` to `x-pgw-sdk`, now spelled in lower case to match the other headers the SDK sends. Header names are case-insensitive, so only the name itself changed; the value format (`sdk-js/<version>`) is unchanged.

## 0.12.0

### Breaking changes

- The constructor validates its arguments and throws a `TypeError` when `apiUrl`, `fingerprintVisitorId`, `merchantId` or `sessionId` is missing, empty or not a string, when `isSecure` is not a boolean, or when `retryOptions` is malformed (not an object, `retryCount` not a non-negative integer, `retryStatusCode` not a function). Previously invalid arguments were accepted silently.
- Failed requests now reject with a `RequestError` (subclass of `Error`) instead of a plain `Error`. Existing `catch` blocks keep working, but error messages changed for some failure classes:
  - network failures reject with `request to <url> failed after N attempt(s): <reason>` (previously the raw `fetch` error, e.g. `Failed to fetch`);
  - non-200 responses without an `error` field in the body reject with `unexpected response status <code>` (previously the message was empty);
  - responses with a non-JSON body reject with `request to <url> returned invalid JSON (status <code>)` (previously the raw `JSON.parse` error).

  Code that matches on `error.message` for these cases needs updating; code that only reads `error.message` for display keeps working.

- To keep the 0.11.0 behaviour of a single request per call, pass `{ retryCount: 0 }` as the sixth constructor argument. The `RequestError` type, the changed error messages and the `console.error` dump apply regardless of whether retries are enabled.

### Added

- Failed HTTP requests are retried automatically with exponential backoff (`100ms → 200ms → 500ms → 1000ms → 2000ms`), 5 retries by default. Network errors are always retried; responses are retried when the status is `< 200`, `408`, or `>= 500` (400 is not retried: the API returns it for deterministic validation failures and duplicate-submit rejections). Configurable via the new optional `retryOptions` constructor argument (`retryCount`, `retryStatusCode`), passed after `isSecure` — see the README for details.
- `RequestError.diagnostics` carries a full diagnostic payload: failure kind (`network` / `http_error` / `invalid_json`), SDK version, request info with a per-attempt log, sanitized response body for non-200 responses (truncated, digit runs masked), the `error` field of the response body, and environment info (`navigator.onLine`, `document.visibilityState`, `navigator.connection`). The same payload is logged with `console.error` together with the error message; each retry is reported with `console.warn`.
- New exports: `RequestError`, `RetryOptions`, `RequestDiagnostics`, `RequestAttempt`.
- `publish-beta` GitHub workflow: publishes `<version>-beta.<run number>` to npm under the `beta` dist-tag without touching `latest`.

Releases before 0.12.0 are not backfilled here — see the git history.
