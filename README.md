# processing-sdk

Use `new FinteqHubProcessing(apiUrl: string, fingerprintVisitorId: string, merchantId: string, sessionId: string, isSecure?: boolean)` to create an instance of the FinteqHubProcessing object. The FinteqHubProcessing object is your entrypoint to FinteqHub processing SDK.

```
const processing = new FinteqHubProcessing('api-url', 'fingerprint-visitor-id', 'merchant-id', 'session-id');
```

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

const processing = new FinteqHubProcessing(apiUrl, result.visitorId, merchantId, sessionId);
const session = await processing.getSession();

const data = {/** collect data from form and session **/}

processing
  .submitForm(data)
  .then(result => console.log(result))
  .catch(error => console.warn(error));
```

## Releasing

On every version bump update **both** `package.json` `version` and `SDK_VERSION` in `src/version.ts` — they must stay in sync so the `X-Finteqhub-SDK` header reports the right version. `src/version.test.ts` fails CI if they drift.

### Beta releases

To try changes before bumping the version, run the `publish-beta` workflow (GitHub → Actions → publish-beta → Run workflow, pick your branch). It publishes `<current version>-beta.<run number>` to npm under the `beta` dist-tag — `latest` and the version in the repo stay untouched. Install it with:

```
npm i @finteqhub/sdk-js@beta
```

or pin the exact version printed in the workflow summary.
