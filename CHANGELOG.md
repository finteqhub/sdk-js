# Changelog

Notable changes to `@finteqhub/sdk-js`. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
