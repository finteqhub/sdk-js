import { uuid, getDeviceType, getDeviceData, validateOptions } from "./utils";
import { ProcessingOptions } from "./processing";

test(`function ${uuid.name} should work correctly`, () => {
  Date.now = jest.fn(() => 1487076708000);
  window.performance.now = jest.fn(() => 1943667.0999999642);
  Math.random = jest.fn(() => 0.4);

  expect(uuid()).toEqual("97dd1229-0b76-4666-2666-666666666666");

  // @ts-ignore
  window.performance.now = undefined;
  expect(uuid()).toEqual("60423029-0b76-4666-2666-666666666666");
});

describe("getDeviceType", () => {
  let userAgentSpy;

  beforeEach(() => {
    userAgentSpy = jest.spyOn(window.navigator, "userAgent", "get");
  });

  afterEach(() => {
    userAgentSpy.mockRestore();
  });

  test("should detect wearable device", () => {
    userAgentSpy.mockReturnValue(
      "Mozilla/5.0 (Apple Watch; CPU WatchOS 7_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
    );
    expect(getDeviceType()).toEqual("wearable");
  });

  test("should detect tablet device", () => {
    userAgentSpy.mockReturnValue(
      "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)"
    );
    expect(getDeviceType()).toEqual("tablet");
  });

  test("should detect TV device", () => {
    userAgentSpy.mockReturnValue(
      "Mozilla/5.0 (SmartTV; LG WebOS TV 4.0; 55UK6500MLA) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36 WebAppManager"
    );
    expect(getDeviceType()).toEqual("TV");
  });

  test("should detect console device", () => {
    userAgentSpy.mockReturnValue(
      "Mozilla/5.0 (PlayStation; PlayStation 5/1.00) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
    );
    expect(getDeviceType()).toEqual("console");
  });

  test("should detect phone device", () => {
    userAgentSpy.mockReturnValue(
      "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36"
    );
    expect(getDeviceType()).toEqual("phone");
  });

  test("should detect computer device", () => {
    userAgentSpy.mockReturnValue(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.62 Safari/537.36"
    );
    expect(getDeviceType()).toEqual("computer");
  });
});

describe(`function ${validateOptions.name} should work correctly`, () => {
  const options: ProcessingOptions = {
    apiUrl: "api-url",
    fingerprintVisitorId: "fingerprint-visitor-id",
    merchantId: "merchant-id",
    sessionId: "session-id",
  };

  test("throws when options is not an object", () => {
    for (const value of ["api-url", null, undefined, 42]) {
      expect(() => validateOptions(value as unknown as ProcessingOptions)).toThrow(
        "sdk-js: constructor expects an options object"
      );
    }
  });

  test.each(["apiUrl", "fingerprintVisitorId", "merchantId", "sessionId"] as const)(
    `throws when "%s" is missing, empty or not a string`,
    (key) => {
      const { [key]: omitted, ...rest } = options;
      for (const broken of [rest, { ...options, [key]: "" }, { ...options, [key]: 42 }]) {
        expect(() => validateOptions(broken as ProcessingOptions)).toThrow(
          `sdk-js: option "${key}" must be a non-empty string`
        );
      }
    }
  );

  test("throws when isSecure is not a boolean", () => {
    expect(() => validateOptions({ ...options, isSecure: "yes" } as unknown as ProcessingOptions)).toThrow(
      'sdk-js: option "isSecure" must be a boolean'
    );
  });

  test("throws when retryOptions is not an object", () => {
    for (const retryOptions of [5, "retry", null]) {
      expect(() => validateOptions({ ...options, retryOptions } as unknown as ProcessingOptions)).toThrow(
        'sdk-js: option "retryOptions" must be an object'
      );
    }
  });

  test("throws when retryCount is not a non-negative integer", () => {
    for (const retryCount of [-1, 1.5, NaN, "5"]) {
      expect(() =>
        validateOptions({ ...options, retryOptions: { retryCount } } as unknown as ProcessingOptions)
      ).toThrow('sdk-js: option "retryOptions.retryCount" must be a non-negative integer');
    }
  });

  test("throws when retryStatusCode is not a function", () => {
    expect(() =>
      validateOptions({ ...options, retryOptions: { retryStatusCode: [500] } } as unknown as ProcessingOptions)
    ).toThrow('sdk-js: option "retryOptions.retryStatusCode" must be a function');
  });

  test("accepts valid options", () => {
    expect(() => validateOptions(options)).not.toThrow();
    expect(() => validateOptions({ ...options, retryOptions: {} })).not.toThrow();
    expect(() =>
      validateOptions({ ...options, isSecure: true, retryOptions: { retryCount: 0, retryStatusCode: () => false } })
    ).not.toThrow();
  });
});

test(`function ${getDeviceData.name} should work correctly`, () => {
  Object.defineProperty(window, "innerWidth", {
    value: 411,
  });
  Object.defineProperty(navigator, "userAgentData", {
    value: { platform: "mock-platform" },
    configurable: true,
  });

  Object.defineProperty(navigator, "platform", {
    value: "iPhone",
    configurable: true,
  });
  Object.defineProperty(navigator, "userAgent", {
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    configurable: true,
  });
  Object.defineProperty(navigator, "language", {
    value: "en-Mock",
    configurable: true,
  });
  Object.defineProperty(screen, "colorDepth", {
    value: 24,
    configurable: true,
  });
  Object.defineProperty(screen, "height", {
    value: 400,
    configurable: true,
  });
  Object.defineProperty(screen, "width", {
    value: 200,
    configurable: true,
  });
  Object.defineProperty(window, "outerHeight", {
    value: 400,
    configurable: true,
  });
  Object.defineProperty(window, "outerWidth", {
    value: 200,
    configurable: true,
  });

  Object.defineProperty(window, "innerHeight", {
    value: 400,
    configurable: true,
  });
  Object.defineProperty(window, "innerWidth", {
    value: 200,
    configurable: true,
  });

  jest.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-120);

  expect(getDeviceData()).toEqual({
    device: {
      type: "phone",
      browser: {
        platform: "mock-platform",
        acceptHeader: "application/json",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        javaEnabled: false,
        javaScriptEnabled: true,
        language: "en-Mock",
        colorDepth: 24,
        screenHeight: 400,
        screenWidth: 200,
        windowHeight: 400,
        windowWidth: 200,
        windowInnerHeight: 400,
        windowInnerWidth: 200,
        timeZoneOffset: -120,
        timeZoneName: expect.anything(),
      },
    },
  });
});
