# processing-sdk

Use `new FinteqHubProcessing(apiUrl: string, fingerprintVisitorId: string, merchantId: string, sessionId: string)` to create an instance of the FinteqHubProcessing object. The FinteqHubProcessing object is your entrypoint to FinteqHub processing SDK.

```
const processing = new FinteqHubProcessing('api-url', 'fingerprint-visitor-id', 'merchant-id', 'session-id');
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
