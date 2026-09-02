import type { ProcessingOptions } from "./processing";

export const DeviceType = {
  Unknown: "unknown",
  Computer: "computer",
  Tablet: "tablet",
  Phone: "phone",
  Console: "console",
  Wearable: "wearable",
  TV: "TV",
};

export function uuid() {
  let seed = Date.now();
  if (window.performance && typeof window.performance.now === "function") {
    seed += performance.now();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const random = (seed + Math.random() * 16) % 16 | 0;
    seed = Math.floor(seed / 16);

    return (c === "x" ? random : random & (0x3 | 0x8)).toString(16);
  });
}

export function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/watch|wearable|galaxy watch|apple watch/i.test(userAgent)) {
    return DeviceType.Wearable;
  }

  if (/ipad|tablet/i.test(userAgent)) {
    return DeviceType.Tablet;
  }

  if (
    /smart[- ]?tv|hbbtv|netcast|viera|aquos|dtv|appletv|googletv|roku|hulu|smarttv/i.test(userAgent)
  ) {
    return DeviceType.TV;
  }

  if (/xbox|playstation|nintendo|switch/i.test(userAgent)) {
    return DeviceType.Console;
  }

  if (/mobile|android|iphone|ipod|blackberry|phone/i.test(userAgent)) {
    return DeviceType.Phone;
  }

  if (/windows|mac os|x11|ubuntu|fedora|debian/i.test(userAgent)) {
    return DeviceType.Computer;
  }

  return DeviceType.Unknown;
}

const REQUIRED_OPTIONS = ["apiUrl", "fingerprintVisitorId", "merchantId", "sessionId"] as const;

export function validateOptions(options: ProcessingOptions) {
  if (typeof options !== "object" || options === null) {
    throw new TypeError(
      "sdk-js: constructor expects an options object: { apiUrl, fingerprintVisitorId, merchantId, sessionId, isSecure?, retryOptions? }"
    );
  }
  for (const key of REQUIRED_OPTIONS) {
    if (typeof options[key] !== "string" || options[key] === "") {
      throw new TypeError(`sdk-js: option "${key}" must be a non-empty string`);
    }
  }
  if (options.isSecure !== undefined && typeof options.isSecure !== "boolean") {
    throw new TypeError('sdk-js: option "isSecure" must be a boolean');
  }
  if (options.retryOptions !== undefined) {
    if (typeof options.retryOptions !== "object" || options.retryOptions === null) {
      throw new TypeError('sdk-js: option "retryOptions" must be an object');
    }
    const { retryCount, retryStatusCode } = options.retryOptions;
    if (retryCount !== undefined && (!Number.isInteger(retryCount) || retryCount < 0)) {
      throw new TypeError('sdk-js: option "retryOptions.retryCount" must be a non-negative integer');
    }
    if (retryStatusCode !== undefined && typeof retryStatusCode !== "function") {
      throw new TypeError('sdk-js: option "retryOptions.retryStatusCode" must be a function');
    }
  }
}

export function getDeviceData() {
  return {
    device: {
      type: getDeviceType(),
      browser: {
        platform:
          (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData
            ?.platform ??
          navigator.platform ??
          "unknown",
        acceptHeader: "application/json",
        userAgent: navigator.userAgent,
        javaEnabled:
          !!navigator?.javaEnabled && navigator.javaEnabled() ? navigator.javaEnabled() : false,
        javaScriptEnabled: true,
        language: navigator.language,
        colorDepth: screen.colorDepth,
        screenHeight: screen.height,
        screenWidth: screen.width,
        windowHeight: window.outerHeight,
        windowWidth: window.outerWidth,
        windowInnerHeight: window.innerHeight,
        windowInnerWidth: window.innerWidth,
        timeZoneOffset: new Date().getTimezoneOffset(),
        timeZoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
  };
}
