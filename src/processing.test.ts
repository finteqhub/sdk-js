import "whatwg-fetch";

import { FinteqHubProcessing } from "./processing";
import { SubmitData } from "./typings";

describe(`function ${FinteqHubProcessing.prototype.getSession.name} should work correctly`, () => {
  const apiUrl = "api-url";
  const fingerprintVisitorId = "fingerprint-visitor-id";
  const merchantId = "merchant-id";
  const sessionId = "session-id";

  const processing = new FinteqHubProcessing(apiUrl, fingerprintVisitorId, merchantId, sessionId);

  const session = {
    operation: {
      amount: "1",
      currencyCode: "EUR",
      failUrl: "",
      integration: "none",
      operationId: "01847fcf-b9ce-6d7a-8c13-2c5c16739c35",
      paymentMethod: "card-acquirer",
      projectId: "0184769d-7360-af60-2150-dbe075a00b14",
      successUrl: "",
      transactionId: "01847fcf-b9ce-980b-e46b-9dea94ab0524",
      transactionType: "deposit",
    },
    session: {
      createdAt: "2022-11-16T09:40:30.839277298Z",
      ttl: 86400,
    },
  };
  const error = "error";

  test(`return session correctly`, async () => {
    const fetchFn = (window.fetch = jest.fn(() => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(session),
      });
    }) as jest.Mock);

    const res = await processing.getSession();
    expect(res).toEqual(session);

    expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "x-merchant-id": merchantId,
      },
    });
  });

  test(`error on session request`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            error,
          }),
      })
    ) as jest.Mock);

    try {
      await processing.getSession();
    } catch (err) {
      expect(err.message).toEqual(error);
    }

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test(`status is not 200 on session request`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({
        status: 400,
        json: () =>
          Promise.resolve({
            error,
          }),
      })
    ) as jest.Mock);

    try {
      await processing.getSession();
    } catch (err) {
      expect(err.message).toEqual(error);
    }

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});

describe(`function ${FinteqHubProcessing.prototype.submitForm.name} should work correctly`, () => {
  const apiUrl = "api-url";
  const fingerprintVisitorId = "fingerprint-visitor-id";
  const merchantId = "merchant-id";
  const sessionId = "session-id";

  const processing = new FinteqHubProcessing(apiUrl, fingerprintVisitorId, merchantId, sessionId);

  const data: SubmitData = {
    type: "CartographerCredentials",
    card: {
      number: "1234567890123456",
      holder: "Boris Britva",
      expiryMonth: 10,
      expiryYear: 2100,
      CVV: "111",
      tokenize: true,
    },
    billingAddress: {
      address: "Ulica huulica",
      city: "Moscow",
      state: "US",
      country: "US",
      postalCode: "123456",
    },
    payer: {
      firstName: "Boris Britva",
      lastName: "10",
      email: "kek@bek.com",
      country: "US",
      birthDate: "1996-10-03",
      phoneNumber: "297776655",
      phoneCountryCode: "+375",
    },
  };

  const headers = {
    "Content-Type": "application/json;charset=UTF-8",
    "x-merchant-id": merchantId,
    "x-request-id": expect.anything(),
    "x-fingerprint": fingerprintVisitorId,
    "x-session-id": sessionId,
  };
  const redirectUrl = "redirect.url";
  const operationId = "operation.id";
  const error = "error";

  test(`type: redirect, status: 200`, async () => {
    let count = 0;
    const resolve = {
      type: "redirect",
      redirectUrl,
    };

    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return Promise.resolve({
        status: 200,
        json: () => {
          if (count === 1) {
            return Promise.resolve({
              operationId,
            });
          } else {
            return Promise.resolve(resolve);
          }
        },
      });
    }) as jest.Mock);

    const res = await processing.submitForm(data);
    expect(res).toEqual(resolve);

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v2/transactions/submit-form`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/operations/${operationId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
  });

  test(`should type: wait works correctly`, async () => {
    let count = 0;
    const resolve = {
      type: "redirect",
      redirectUrl,
    };

    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return Promise.resolve({
        status: 200,
        json: () => {
          if (count === 1) {
            return Promise.resolve({
              operationId,
            });
          } else if (count === 2) {
            return Promise.resolve({
              type: "wait",
              waitInterval: 0.1,
            });
          } else {
            return Promise.resolve(resolve);
          }
        },
      });
    }) as jest.Mock);

    const res = await processing.submitForm(data);

    expect(res).toEqual(resolve);
  });

  test(`error on submit request`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            error,
          }),
      })
    ) as jest.Mock);

    try {
      await processing.submitForm(data);
    } catch (err) {
      expect(err.message).toEqual(error);
    }

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test(`status is not 200 on submit request`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({
        status: 400,
        json: () =>
          Promise.resolve({
            error,
          }),
      })
    ) as jest.Mock);

    try {
      await processing.submitForm(data);
    } catch (err) {
      expect(err.message).toEqual(error);
    }

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test(`type: submit, status: 200`, async () => {
    let count = 0;
    const formUrl = "form.url";
    const resolve = {
      type: "redirect",
      redirectUrl,
    };

    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return Promise.resolve({
        status: 200,
        json: () => {
          if (count === 1) {
            return Promise.resolve({
              operationId,
            });
          } else if (count === 2) {
            return Promise.resolve({
              type: "submitForm",
              formUrl,
            });
          } else if (count === 3) {
            return Promise.resolve(resolve);
          }
        },
      });
    }) as jest.Mock);

    const iframeMock = { style: {}, src: "", onload: () => {} };

    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.createElement = jest.fn(() => iframeMock) as jest.Mock;

    const promise = processing.submitForm(data).then((res) => expect(res).toEqual(resolve));

    setTimeout(() => {
      expect(iframeMock.src).toEqual(formUrl);

      iframeMock.onload();

      expect(fetchFn).toHaveBeenCalledTimes(3);
      expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v2/transactions/submit-form`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/operations/${operationId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
    });

    await expect(promise).resolves.not.toThrow();
  });

  test(`unknown type`, async () => {
    let count = 0;

    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return Promise.resolve({
        status: 200,
        json: () => {
          if (count === 1) {
            return Promise.resolve({
              operationId,
            });
          } else {
            return Promise.resolve({
              type: "unknown",
              redirectUrl,
            });
          }
        },
      });
    }) as jest.Mock);

    try {
      await processing.submitForm(data);
    } catch (err) {
      expect(err.message).toEqual("unknown process operation type");
    }

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  test(`status is not 200 on process operation`, async () => {
    let count = 0;

    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return count === 1
        ? Promise.resolve({
            status: 200,
            json: () =>
              Promise.resolve({
                operationId,
              }),
          })
        : Promise.resolve({
            status: 400,
            json: () =>
              Promise.resolve({
                error,
              }),
          });
    }) as jest.Mock);

    try {
      await processing.submitForm(data);
    } catch (err) {
      expect(err.message).toEqual(error);
    }

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
