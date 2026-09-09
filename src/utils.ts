import type { RetryOptions } from "./processing";

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

type ConstructorArguments = {
  apiUrl: string;
  fingerprintVisitorId: string;
  merchantId: string;
  sessionId: string;
  isSecure: boolean;
  retryOptions: RetryOptions;
};

const REQUIRED_STRINGS = ["apiUrl", "fingerprintVisitorId", "merchantId", "sessionId"] as const;

export function validateArguments(args: ConstructorArguments) {
  for (const key of REQUIRED_STRINGS) {
    if (typeof args[key] !== "string" || args[key] === "") {
      throw new TypeError(`sdk-js: ${key} must be a non-empty string`);
    }
  }
  if (typeof args.isSecure !== "boolean") {
    throw new TypeError("sdk-js: isSecure must be a boolean");
  }
  const { retryOptions } = args;
  if (typeof retryOptions !== "object" || retryOptions === null) {
    throw new TypeError("sdk-js: retryOptions must be an object");
  }
  const { retryCount, retryStatusCode } = retryOptions;
  if (retryCount !== undefined && (!Number.isInteger(retryCount) || retryCount < 0)) {
    throw new TypeError("sdk-js: retryOptions.retryCount must be a non-negative integer");
  }
  if (retryStatusCode !== undefined && typeof retryStatusCode !== "function") {
    throw new TypeError("sdk-js: retryOptions.retryStatusCode must be a function");
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
