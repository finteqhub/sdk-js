import { uuid, getDeviceType, getDeviceData, getClientHints, validateArguments } from "./utils";

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

describe(`function ${validateArguments.name} should work correctly`, () => {
  type Args = Parameters<typeof validateArguments>[0];
  const args: Args = {
    apiUrl: "api-url",
    fingerprintVisitorId: "fingerprint-visitor-id",
    sessionId: "session-id",
    isSecure: false,
    retryOptions: {},
  };

  test.each(["apiUrl", "fingerprintVisitorId", "sessionId"] as const)(
    "throws when %s is missing, empty or not a string",
    (key) => {
      for (const value of [undefined, "", 42]) {
        expect(() => validateArguments({ ...args, [key]: value } as unknown as Args)).toThrow(
          `sdk-js: ${key} must be a non-empty string`
        );
      }
    }
  );

  test("throws when isSecure is not a boolean", () => {
    for (const isSecure of ["yes", null, 1]) {
      expect(() => validateArguments({ ...args, isSecure } as unknown as Args)).toThrow("sdk-js: isSecure must be a boolean");
    }
  });

  test("throws when retryOptions is not an object", () => {
    for (const retryOptions of [5, "retry", null]) {
      expect(() => validateArguments({ ...args, retryOptions } as unknown as Args)).toThrow(
        "sdk-js: retryOptions must be an object"
      );
    }
  });

  test("throws when retryCount is not a non-negative integer", () => {
    for (const retryCount of [-1, 1.5, NaN, Infinity, "5"]) {
      expect(() => validateArguments({ ...args, retryOptions: { retryCount } } as unknown as Args)).toThrow(
        "sdk-js: retryOptions.retryCount must be a non-negative integer"
      );
    }
  });

  test("throws when retryStatusCode is not a function", () => {
    expect(() => validateArguments({ ...args, retryOptions: { retryStatusCode: [500] } } as unknown as Args)).toThrow(
      "sdk-js: retryOptions.retryStatusCode must be a function"
    );
  });

  test("accepts valid arguments", () => {
    expect(() => validateArguments(args)).not.toThrow();
    expect(() =>
      validateArguments({ ...args, isSecure: true, retryOptions: { retryCount: 0, retryStatusCode: () => false } })
    ).not.toThrow();
  });
});

test(`function ${getDeviceData.name} should work correctly`, async () => {
  Object.defineProperty(window, "innerWidth", {
    value: 411,
  });
  Object.defineProperty(navigator, "userAgentData", {
    value: {
      platform: "mock-platform",
      mobile: true,
      brands: [{ brand: "Chromium", version: "130" }],
      getHighEntropyValues: () => Promise.resolve({
        brands: [{ brand: "Chromium", version: "130" }],
        mobile: true,
        platform: "mock-platform",
        model: "SM-G991B",
        platformVersion: "13.0.0",
      }),
    },
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

  expect(await getDeviceData()).toEqual({
    device: {
      type: "phone",
      browser: {
        platform: "mock-platform",
        acceptHeader: "application/json",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        clientHints: {
          brands: [{ brand: "Chromium", version: "130" }],
          mobile: true,
          model: "SM-G991B",
          platform: "mock-platform",
          platformVersion: "13.0.0",
        },
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

test(`${getDeviceData.name} omits clientHints without the API`, async () => {
  Object.defineProperty(navigator, "userAgentData", { value: undefined, configurable: true });

  expect(await getDeviceData()).not.toHaveProperty("device.browser.clientHints");
});

describe("getClientHints", () => {
  const originalUserAgentData = Object.getOwnPropertyDescriptor(navigator, "userAgentData");
  const mockUserAgentData = (value: unknown) =>
    Object.defineProperty(navigator, "userAgentData", { value, configurable: true });

  afterEach(() => {
    if (originalUserAgentData) {
      Object.defineProperty(navigator, "userAgentData", originalUserAgentData);
    } else {
      delete (navigator as Navigator & { userAgentData?: unknown }).userAgentData;
    }
  });

  test("returns the browser's native hints without changing keys or values", async () => {
    const getHighEntropyValues = jest.fn(async () => ({
      brands: [{ brand: "Not?A_Brand", version: "99" }],
      mobile: false,
      platform: "Android",
      architecture: "arm",
      bitness: "64",
      formFactors: ["Mobile"],
      fullVersionList: [
        { brand: "Chromium", version: "130.0.0.0" },
        { brand: "Not?A_Brand", version: "99.0.0.0" },
      ],
      model: "Pixel 3 XL",
      platformVersion: "13.0.0",
      uaFullVersion: "130.0.6723.58",
      wow64: false,
    }));
    mockUserAgentData({
      brands: [{ brand: "Not?A_Brand", version: "99" }],
      mobile: false,
      platform: "Android",
      getHighEntropyValues,
    });

    expect(await getClientHints()).toEqual({
      brands: [{ brand: "Not?A_Brand", version: "99" }],
      mobile: false,
      platform: "Android",
      architecture: "arm",
      bitness: "64",
      formFactors: ["Mobile"],
      fullVersionList: [
        { brand: "Chromium", version: "130.0.0.0" },
        { brand: "Not?A_Brand", version: "99.0.0.0" },
      ],
      model: "Pixel 3 XL",
      platformVersion: "13.0.0",
      uaFullVersion: "130.0.6723.58",
      wow64: false,
    });
    expect(getHighEntropyValues).toHaveBeenCalledWith([
      "architecture", "bitness", "formFactors", "fullVersionList",
      "model", "platformVersion", "uaFullVersion", "wow64",
    ]);
  });

  test.each([
    ["unavailable", undefined],
    ["denied", () => Promise.reject(new Error("NotAllowedError"))],
  ])("falls back to low entropy hints when high entropy values are %s", async (_, getHighEntropyValues) => {
    mockUserAgentData({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: true,
      platform: "Android",
      getHighEntropyValues,
    });

    expect(await getClientHints()).toEqual({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: true,
      platform: "Android",
    });
  });

  test("returns nothing on browsers without the client hints API", async () => {
    mockUserAgentData(undefined);

    expect(await getClientHints()).toEqual({});
  });

  test("preserves an empty model and only the hints returned by the browser", async () => {
    mockUserAgentData({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: false,
      platform: "macOS",
      getHighEntropyValues: () => Promise.resolve({
        brands: [{ brand: "Chromium", version: "130" }],
        mobile: false,
        platform: "macOS",
        model: "",
      }),
    });

    expect(await getClientHints()).toEqual({
      brands: [{ brand: "Chromium", version: "130" }],
      mobile: false,
      platform: "macOS",
      model: "",
    });
  });
});
