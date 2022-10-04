# processing-sdk

Use `new FinteqHubProcessing(apiUrl: string, fingerprintVisitorId: string, merchantId: string, sessionId: string)` to create an instance of the FinteqHubProcessing object. The FinteqHubProcessing object is your entrypoint to FinteqHub processing SDK.

```
const processing = new FinteqHubProcessing('api-url', 'fingerprint-visitor-id', 'merchant-id', 'session-id');
```

## processing.submitForm(data)

Use `processing.submitForm` to submit transaction. When called, `processing.submitForm` will attempt to complete any required actions to process transaction. This method returns a Promise which resolves with a string (redirect url) or Error that describes the failure.

```
processing
  .submitForm(data)
  .then(redirectUrl => window.location.replace(redirectUrl))
  .catch(error => console.warn(error));
```
