import "whatwg-fetch";

import { FinteqHubProcessing, RequestError } from "./processing";
import { SubmitData } from "./typings";
import { getDeviceData } from "./utils";
import { TxType } from "./consts";
import { SDK_HEADER_NAME, SDK_HEADER_VALUE, SDK_VERSION } from "./version";

let warnSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  errorSpy.mockRestore();
});

describe(`function ${FinteqHubProcessing.prototype.getSession.name} should work correctly`, () => {
  const apiUrl = "api-url";
  const fingerprintVisitorId = "fingerprint-visitor-id";
  const merchantId = "merchant-id";
  const sessionId = "session-id";

  const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });

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
        text: () => Promise.resolve(JSON.stringify(session)),
      });
    }) as jest.Mock);

    const res = await processing.getSession();
    expect(res).toEqual(session);

    expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "x-merchant-id": merchantId,
        "x-request-id": expect.anything(),
        [SDK_HEADER_NAME]: SDK_HEADER_VALUE,
      },
    });
  });

  test(`error on session request`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ error })),
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
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ error })),
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

describe(`function ${FinteqHubProcessing.prototype.getSession.name} with secure merchantId should work correctly`, () => {
  const apiUrl = "api-url";
  const fingerprintVisitorId = "fingerprint-visitor-id";
  const merchantId = "merchant-id";
  const sessionId = "session-id";
  const isSecure = true;

  const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, isSecure });

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
        text: () => Promise.resolve(JSON.stringify(session)),
      });
    }) as jest.Mock);

    const res = await processing.getSession();
    expect(res).toEqual(session);

    expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/secure/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "x-merchant-id": merchantId,
        "x-request-id": expect.anything(),
        [SDK_HEADER_NAME]: SDK_HEADER_VALUE,
      },
    });
  });

  test(`error on session request`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ error })),
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
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ error })),
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

  const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });

  const data: SubmitData = {
    credentials: {
      card: {
        number: "1234567890123456",
        holder: "Boris Britva",
        expiryMonth: 10,
        expiryYear: 2100,
        cvv: "111",
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
        merchantCustomerId: "john@doe.com",
        firstName: "Boris Britva",
        lastName: "10",
        email: "kek@bek.com",
        document: "document",
        birthDate: "1996-10-03",
        phoneNumber: "297776655",
        phoneCountryCode: "+375",
      },
    },
    paymentMethod: "card-acquirer",
    transactionType: TxType.Deposit,
  };

  const headers = {
    "Content-Type": "application/json;charset=UTF-8",
    "x-merchant-id": merchantId,
    "x-request-id": expect.anything(),
    "x-fingerprint": fingerprintVisitorId,
    "x-session-id": sessionId,
    [SDK_HEADER_NAME]: SDK_HEADER_VALUE,
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
        text: () => Promise.resolve(JSON.stringify(count === 1 ? { operationId } : resolve)),
      });
    }) as jest.Mock);

    const res = await processing.submitForm(data);
    expect(res).toEqual(resolve);

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/transactions/submit-form`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        session: {
          fingerprint: fingerprintVisitorId,
          ...getDeviceData(),
        },
        ...data,
      }),
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
        text: () => {
          if (count === 1) {
            return Promise.resolve(JSON.stringify({ operationId }));
          } else if (count === 2) {
            return Promise.resolve(JSON.stringify({ type: "wait", waitInterval: 0.1 }));
          } else {
            return Promise.resolve(JSON.stringify(resolve));
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
        text: () => Promise.resolve(JSON.stringify({ error })),
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
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ error })),
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
        text: () => {
          if (count === 1) {
            return Promise.resolve(JSON.stringify({ operationId }));
          } else if (count === 2) {
            return Promise.resolve(JSON.stringify({ type: "submitForm", formUrl }));
          } else if (count === 3) {
            return Promise.resolve(JSON.stringify(resolve));
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
      expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/transactions/submit-form`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          session: {
            fingerprint: fingerprintVisitorId,
            ...getDeviceData(),
          },
          ...data,
        }),
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
        text: () => {
          if (count === 1) {
            return Promise.resolve(JSON.stringify({ operationId }));
          } else {
            return Promise.resolve(JSON.stringify({ type: "unknown", redirectUrl }));
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
            text: () => Promise.resolve(JSON.stringify({ operationId })),
          })
        : Promise.resolve({
            status: 404,
            text: () => Promise.resolve(JSON.stringify({ error })),
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

describe(`function ${FinteqHubProcessing.prototype.submitForm.name} with secure merchantId should work correctly`, () => {
  const apiUrl = "api-url";
  const fingerprintVisitorId = "fingerprint-visitor-id";
  const merchantId = "merchant-id";
  const sessionId = "session-id";
  const isSecure = true;

  const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, isSecure });

  const data: SubmitData = {
    credentials: {
      card: {
        number: "1234567890123456",
        holder: "Boris Britva",
        expiryMonth: 10,
        expiryYear: 2100,
        cvv: "111",
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
        merchantCustomerId: "john@doe.com",
        firstName: "Boris Britva",
        lastName: "10",
        email: "kek@bek.com",
        document: "document",
        birthDate: "1996-10-03",
        phoneNumber: "297776655",
        phoneCountryCode: "+375",
      },
    },
    paymentMethod: "card-acquirer",
    transactionType: TxType.Deposit,
  };

  const headers = {
    "Content-Type": "application/json;charset=UTF-8",
    "x-merchant-id": merchantId,
    "x-request-id": expect.anything(),
    "x-fingerprint": fingerprintVisitorId,
    "x-session-id": sessionId,
    [SDK_HEADER_NAME]: SDK_HEADER_VALUE,
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
        text: () => Promise.resolve(JSON.stringify(count === 1 ? { operationId } : resolve)),
      });
    }) as jest.Mock);

    const res = await processing.submitForm(data);
    expect(res).toEqual(resolve);

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/secure/transactions/submit-form`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        session: {
          fingerprint: fingerprintVisitorId,
          ...getDeviceData(),
        },
        ...data,
      }),
    });
    expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/secure/operations/${operationId}`, {
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
        text: () => {
          if (count === 1) {
            return Promise.resolve(JSON.stringify({ operationId }));
          } else if (count === 2) {
            return Promise.resolve(JSON.stringify({ type: "wait", waitInterval: 0.1 }));
          } else {
            return Promise.resolve(JSON.stringify(resolve));
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
        text: () => Promise.resolve(JSON.stringify({ error })),
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
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ error })),
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
        text: () => {
          if (count === 1) {
            return Promise.resolve(JSON.stringify({ operationId }));
          } else if (count === 2) {
            return Promise.resolve(JSON.stringify({ type: "submitForm", formUrl }));
          } else if (count === 3) {
            return Promise.resolve(JSON.stringify(resolve));
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
      expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/secure/transactions/submit-form`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          session: {
            fingerprint: fingerprintVisitorId,
            ...getDeviceData(),
          },
          ...data,
        }),
      });
      expect(fetchFn).toHaveBeenCalledWith(`${apiUrl}/v1/secure/operations/${operationId}`, {
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
        text: () => {
          if (count === 1) {
            return Promise.resolve(JSON.stringify({ operationId }));
          } else {
            return Promise.resolve(JSON.stringify({ type: "unknown", redirectUrl }));
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
            text: () => Promise.resolve(JSON.stringify({ operationId })),
          })
        : Promise.resolve({
            status: 404,
            text: () => Promise.resolve(JSON.stringify({ error })),
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

describe(`retry and error diagnostics should work correctly`, () => {
  const apiUrl = "api-url";
  const fingerprintVisitorId = "fingerprint-visitor-id";
  const merchantId = "merchant-id";
  const sessionId = "session-id";

  const session = {
    operation: {
      projectId: "0184769d-7360-af60-2150-dbe075a00b14",
    },
  };

  test(`retries retryable status codes until success and warns on every attempt`, async () => {
    let count = 0;
    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return count < 3
        ? Promise.resolve({ status: 500, text: () => Promise.resolve(JSON.stringify({ error: "server error" })) })
        : Promise.resolve({ status: 200, text: () => Promise.resolve(JSON.stringify(session)) });
    }) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });
    const res = await processing.getSession();

    expect(res).toEqual(session);
    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledTimes(2);

    // retries of one logical request must reuse the same x-request-id — the backend dedupes by it
    const requestIds = fetchFn.mock.calls.map((call) => call[1].headers["x-request-id"]);
    expect(requestIds[0]).toBeTruthy();
    expect(new Set(requestIds).size).toBe(1);
  });

  test(`defaults to 5 retries with 100/200/500/1000/2000ms backoff when retryOptions are not passed`, async () => {
    // capture backoff delays instead of waiting them out
    const delays: number[] = [];
    const setTimeoutSpy = jest.spyOn(window, "setTimeout").mockImplementation(((callback: () => void, delay?: number) => {
      delays.push(delay ?? 0);
      callback();
      return 0;
    }) as unknown as typeof window.setTimeout);

    try {
      const fetchFn = (window.fetch = jest.fn(() =>
        Promise.resolve({ status: 500, text: () => Promise.resolve(JSON.stringify({ error: "server error" })) })
      ) as jest.Mock);

      const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });
      await expect(processing.getSession()).rejects.toMatchObject({
        name: "RequestError",
        message: "server error",
      });

      expect(fetchFn).toHaveBeenCalledTimes(6); // the initial attempt + 5 retries
      expect(warnSpy).toHaveBeenCalledTimes(5);
      expect(delays).toEqual([100, 200, 500, 1000, 2000]);
    } finally {
      setTimeoutSpy.mockRestore();
    }
  });

  test.each([199, 408])(`retries status %i by default`, async (status) => {
    let count = 0;
    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return count === 1
        ? Promise.resolve({ status, text: () => Promise.resolve(JSON.stringify({ error: "try again" })) })
        : Promise.resolve({ status: 200, text: () => Promise.resolve(JSON.stringify(session)) });
    }) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });
    const res = await processing.getSession();

    expect(res).toEqual(session);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test(`does not retry non-retryable status codes`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({ status: 404, text: () => Promise.resolve(JSON.stringify({ error: "not found" })) })
    ) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });
    await expect(processing.getSession()).rejects.toMatchObject({
      name: "RequestError",
      message: "not found",
      diagnostics: {
        kind: "http_error",
        sdkVersion: SDK_VERSION,
        response: { status: 404, body: JSON.stringify({ error: "not found" }) },
        request: expect.objectContaining({
          attempts: [expect.objectContaining({ status: 404, durationMs: expect.any(Number) })],
        }),
      },
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test(`does not retry 400 responses (deterministic validation and duplicate-submit rejections)`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({ status: 400, text: () => Promise.resolve(JSON.stringify({ error: "invalid card" })) })
    ) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });
    await expect(processing.getSession()).rejects.toMatchObject({
      name: "RequestError",
      message: "invalid card",
      diagnostics: { kind: "http_error", response: { status: 400 } },
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test(`stops retrying after retryCount and rejects with response error`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({ status: 500, text: () => Promise.resolve(JSON.stringify({ error: "server error" })) })
    ) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, retryOptions: { retryCount: 2 } });
    await expect(processing.getSession()).rejects.toMatchObject({
      name: "RequestError",
      message: "server error",
      diagnostics: {
        kind: "http_error",
        response: { status: 500, body: JSON.stringify({ error: "server error" }) },
        request: expect.objectContaining({
          attempts: [
            expect.objectContaining({ status: 500 }),
            expect.objectContaining({ status: 500 }),
            expect.objectContaining({ status: 500 }),
          ],
        }),
      },
    });

    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  test(`custom retryStatusCode is used instead of the default`, async () => {
    let count = 0;
    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return count === 1
        ? Promise.resolve({ status: 404, text: () => Promise.resolve(JSON.stringify({ error: "not found" })) })
        : Promise.resolve({ status: 200, text: () => Promise.resolve(JSON.stringify(session)) });
    }) as jest.Mock);

    const processing = new FinteqHubProcessing({
      apiUrl,
      fingerprintVisitorId,
      merchantId,
      sessionId,
      retryOptions: { retryStatusCode: (statusCode) => statusCode === 404 },
    });
    const res = await processing.getSession();

    expect(res).toEqual(session);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test(`custom retryStatusCode replaces the default set of retryable statuses`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({ status: 500, text: () => Promise.resolve(JSON.stringify({ error: "server error" })) })
    ) as jest.Mock);

    const processing = new FinteqHubProcessing({
      apiUrl,
      fingerprintVisitorId,
      merchantId,
      sessionId,
      retryOptions: { retryStatusCode: (statusCode) => statusCode === 404 },
    });

    // 500 is retryable by default, but the custom predicate does not include it
    await expect(processing.getSession()).rejects.toMatchObject({
      name: "RequestError",
      message: "server error",
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test(`retries network errors until success`, async () => {
    let count = 0;
    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return count === 1
        ? Promise.reject(new TypeError("Failed to fetch"))
        : Promise.resolve({ status: 200, text: () => Promise.resolve(JSON.stringify(session)) });
    }) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });
    const res = await processing.getSession();

    expect(res).toEqual(session);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test(`retries when reading the response body fails and succeeds on the next attempt`, async () => {
    let count = 0;
    const fetchFn = (window.fetch = jest.fn(() => {
      count += 1;
      return count === 1
        ? Promise.resolve({ status: 200, text: () => Promise.reject(new TypeError("network error")) })
        : Promise.resolve({ status: 200, text: () => Promise.resolve(JSON.stringify(session)) });
    }) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });
    const res = await processing.getSession();

    expect(res).toEqual(session);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test(`rejects with network diagnostics when reading the response body keeps failing`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({ status: 200, text: () => Promise.reject(new TypeError("network error")) })
    ) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, retryOptions: { retryCount: 1 } });

    await expect(processing.getSession()).rejects.toMatchObject({
      name: "RequestError",
      message: expect.stringContaining("network error"),
      diagnostics: {
        kind: "network",
        error: expect.objectContaining({ name: "TypeError", message: "network error" }),
        // headers arrived before the body failed, so the status is known and kept
        response: { status: 200 },
        request: expect.objectContaining({
          attempts: [
            expect.objectContaining({ status: 200, error: "network error", durationMs: expect.any(Number) }),
            expect.objectContaining({ status: 200, error: "network error", durationMs: expect.any(Number) }),
          ],
        }),
      },
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test(`rejects with diagnostics and logs console.error when network retries are exhausted`, async () => {
    const fetchFn = (window.fetch = jest.fn(() => Promise.reject(new TypeError("Failed to fetch"))) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, retryOptions: { retryCount: 1 } });

    await expect(processing.getSession()).rejects.toMatchObject({
      name: "RequestError",
      message: expect.stringContaining("Failed to fetch"),
      diagnostics: {
        kind: "network",
        sdkVersion: SDK_VERSION,
        error: expect.objectContaining({
          name: "TypeError",
          message: "Failed to fetch",
        }),
        request: {
          url: `${apiUrl}/v1/sessions/${sessionId}`,
          method: "GET",
          requestId: expect.any(String),
          sessionId,
          attempts: [
            expect.objectContaining({ error: "Failed to fetch", durationMs: expect.any(Number) }),
            expect.objectContaining({ error: "Failed to fetch", durationMs: expect.any(Number) }),
          ],
        },
        environment: expect.objectContaining({
          visibility: "visible",
          timestamp: expect.any(String),
        }),
      },
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][1]).toEqual(expect.objectContaining({ error: expect.anything() }));
  });

  test(`logs console.error with diagnostics even when retries are disabled`, async () => {
    const fetchFn = (window.fetch = jest.fn(() => Promise.reject(new TypeError("Failed to fetch"))) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, retryOptions: { retryCount: 0 } });

    await expect(processing.getSession()).rejects.toBeInstanceOf(RequestError);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test(`submitForm rejects with diagnostics when network retries are exhausted`, async () => {
    const fetchFn = (window.fetch = jest.fn(() => Promise.reject(new TypeError("Failed to fetch"))) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, retryOptions: { retryCount: 0 } });

    await expect(processing.submitForm({} as SubmitData)).rejects.toMatchObject({
      name: "RequestError",
      diagnostics: expect.objectContaining({
        request: expect.objectContaining({
          url: `${apiUrl}/v1/transactions/submit-form`,
          method: "POST",
          sessionId,
          attempts: [expect.objectContaining({ error: "Failed to fetch" })],
        }),
      }),
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test(`rejects with diagnostics and a masked body snippet when the response is not valid JSON`, async () => {
    window.fetch = jest.fn(() =>
      Promise.resolve({ status: 502, text: () => Promise.resolve("<html>502 Bad Gateway, ray 1234567890</html>") })
    ) as jest.Mock;

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, retryOptions: { retryCount: 0 } });

    await expect(processing.getSession()).rejects.toMatchObject({
      name: "RequestError",
      message: `request to ${apiUrl}/v1/sessions/${sessionId} returned invalid JSON (status 502)`,
      diagnostics: {
        kind: "invalid_json",
        error: expect.objectContaining({ name: "SyntaxError" }),
        response: { status: 502, body: "<html>502 Bad Gateway, ray ***</html>" },
      },
    });

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test(`parse error details of a 200 response are not leaked into diagnostics`, async () => {
    window.fetch = jest.fn(() =>
      Promise.resolve({ status: 200, text: () => Promise.resolve("<html>secret-session-token</html>") })
    ) as jest.Mock;

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, retryOptions: { retryCount: 0 } });

    const err = await processing.getSession().catch((e) => e);
    expect(err).toBeInstanceOf(RequestError);
    expect(err.message).toBe(`request to ${apiUrl}/v1/sessions/${sessionId} returned invalid JSON (status 200)`);
    expect(err.diagnostics.kind).toBe("invalid_json");
    expect(err.diagnostics.response).toEqual({ status: 200, body: undefined });
    // V8's JSON.parse message quotes the malformed input — 200 body content must not leak through it
    expect(JSON.stringify(err.diagnostics)).not.toContain("secret-session-token");
  });

  test(`uses a fallback message when the error response body has no error field`, async () => {
    window.fetch = jest.fn(() => Promise.resolve({ status: 503, text: () => Promise.resolve("{}") })) as jest.Mock;

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId, retryOptions: { retryCount: 0 } });

    await expect(processing.getSession()).rejects.toMatchObject({
      name: "RequestError",
      message: "unexpected response status 503",
      diagnostics: { response: { status: 503 } },
    });
  });

  test(`error field in a 200 response rejects with RequestError and diagnostics`, async () => {
    const fetchFn = (window.fetch = jest.fn(() =>
      Promise.resolve({ status: 200, text: () => Promise.resolve(JSON.stringify({ error: "insufficient funds" })) })
    ) as jest.Mock);

    const processing = new FinteqHubProcessing({ apiUrl, fingerprintVisitorId, merchantId, sessionId });

    const err = await processing.getSession().catch((e) => e);
    expect(err).toBeInstanceOf(RequestError);
    expect(err.message).toBe("insufficient funds");
    expect(err.diagnostics.kind).toBe("http_error");
    // the body of a 200 response may carry session credentials and must never be dumped
    expect(err.diagnostics.response).toEqual({ status: 200, body: undefined });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe(`constructor options validation should work correctly`, () => {
  const options = {
    apiUrl: "api-url",
    fingerprintVisitorId: "fingerprint-visitor-id",
    merchantId: "merchant-id",
    sessionId: "session-id",
  };

  test(`throws when called with positional arguments instead of an options object`, () => {
    expect(
      () => new FinteqHubProcessing("api-url" as unknown as typeof options)
    ).toThrow('sdk-js: constructor expects an options object');
  });

  test(`throws when a required option is missing`, () => {
    const { sessionId, ...incomplete } = options;
    expect(() => new FinteqHubProcessing(incomplete as typeof options)).toThrow(
      'sdk-js: option "sessionId" must be a non-empty string'
    );
  });

  test(`throws when isSecure is not a boolean`, () => {
    expect(
      () => new FinteqHubProcessing({ ...options, isSecure: "yes" as unknown as boolean })
    ).toThrow('sdk-js: option "isSecure" must be a boolean');
  });

  test(`throws when retryCount is not a non-negative integer`, () => {
    expect(
      () => new FinteqHubProcessing({ ...options, retryOptions: { retryCount: -1 } })
    ).toThrow('sdk-js: option "retryOptions.retryCount" must be a non-negative integer');
    expect(
      () => new FinteqHubProcessing({ ...options, retryOptions: { retryCount: "5" as unknown as number } })
    ).toThrow('sdk-js: option "retryOptions.retryCount" must be a non-negative integer');
  });

  test(`throws when retryStatusCode is not a function`, () => {
    expect(
      () => new FinteqHubProcessing({ ...options, retryOptions: { retryStatusCode: [500] as unknown as () => boolean } })
    ).toThrow('sdk-js: option "retryOptions.retryStatusCode" must be a function');
  });

  test(`accepts valid options`, () => {
    expect(
      () => new FinteqHubProcessing({ ...options, isSecure: true, retryOptions: { retryCount: 0, retryStatusCode: () => false } })
    ).not.toThrow();
  });
});
