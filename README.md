# processing-sdk

Use `new FinteqHubProcessing(apiUrl: string, fingerprintVisitorId: string, merchantId: string, sessionId: string, isSecure?: boolean, sendSdkHeader?: boolean)` to create an instance of the FinteqHubProcessing object. The FinteqHubProcessing object is your entrypoint to FinteqHub processing SDK.

```
const processing = new FinteqHubProcessing('api-url', 'fingerprint-visitor-id', 'merchant-id', 'session-id');
```

## SDK identification header

Every request the SDK makes carries an extra header:

```
X-Finteqhub-SDK: sdk-js/<version>
```

The value contains the SDK name and the version taken from `package.json` at build time (for example `sdk-js/0.11.0`). FinteqHub uses this header to identify traffic coming from the official SDK integration — for example to notify affected merchants when a security fix is released. It does not affect authentication or request routing.

The header is sent by default. To opt out, pass `false` as the last constructor argument:

```
const processing = new FinteqHubProcessing(
  'api-url',
  'fingerprint-visitor-id',
  'merchant-id',
  'session-id',
  false, // isSecure
  false, // sendSdkHeader — set to false to skip the identification header
);
```

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
