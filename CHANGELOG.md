# Changelog

Notable changes to `@finteqhub/sdk-js`. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.12.0

### Breaking changes

- `FinteqHubProcessing` constructor now takes a single options object instead of positional arguments:

  ```js
  // before (0.11.x)
  new FinteqHubProcessing(apiUrl, fingerprintVisitorId, merchantId, sessionId, isSecure);

  // after (0.12.0)
  new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, isSecure });
  ```

- The constructor validates its options and throws a `TypeError` when a required option is missing, empty, or has the wrong type (previously invalid arguments were accepted silently).
- Failed requests now reject with a `RequestError` (subclass of `Error`) instead of a plain `Error`. Existing `catch` blocks keep working, but error messages changed for some failure classes:
  - network failures reject with `request to <url> failed after N attempt(s): <reason>` (previously the raw `fetch` error, e.g. `Failed to fetch`);
  - non-200 responses without an `error` field in the body reject with `unexpected response status <code>` (previously the message was empty);
  - responses with a non-JSON body reject with `request to <url> returned invalid JSON (status <code>)` (previously the raw `JSON.parse` error).

  Code that matches on `error.message` for these cases needs updating; code that only reads `error.message` for display keeps working.

### Added

- Failed HTTP requests are retried automatically with exponential backoff (`100ms → 200ms → 500ms → 1000ms → 2000ms`), 5 retries by default. Network errors are always retried; responses are retried when the status is `< 200`, `408`, or `>= 500` (400 is not retried: the API returns it for deterministic validation failures and duplicate-submit rejections). Configurable via the new `retryOptions` constructor option (`retryCount`, `retryStatusCode`) — see the README for details.
- `RequestError.diagnostics` carries a full diagnostic payload: failure kind (`network` / `http_error` / `invalid_json`), SDK version, request info with a per-attempt log, sanitized response body for non-200 responses (truncated, digit runs masked), and environment info (`navigator.onLine`, `document.visibilityState`, `navigator.connection`). The same payload is logged with `console.error`; each retry is reported with `console.warn`.
- New exports: `RequestError`, `ProcessingOptions`, `RetryOptions`, `RequestDiagnostics`, `RequestAttempt`.
- `publish-beta` GitHub workflow: publishes `<version>-beta.<run number>` to npm under the `beta` dist-tag without touching `latest`.

Releases before 0.12.0 are not backfilled here — see the git history.
