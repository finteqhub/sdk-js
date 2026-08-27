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
    const random = ((seed + Math.random() * 16) % 16) | 0;
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

// The User-Agent Client Hints API is Chromium-only and is not in TypeScript's DOM types yet.
type NavigatorUAData = {
  brands?: { brand: string; version: string }[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{
    architecture?: string;
    bitness?: string;
    brands?: { brand: string; version: string }[];
    formFactors?: string[];
    fullVersionList?: { brand: string; version: string }[];
    mobile?: boolean;
    model?: string;
    platform?: string;
    platformVersion?: string;
    uaFullVersion?: string;
    wow64?: boolean;
  }>;
};

const HIGH_ENTROPY_HINTS = [
  "architecture",
  "bitness",
  "formFactors",
  "fullVersionList",
  "model",
  "platformVersion",
  "uaFullVersion",
  "wow64",
];

function userAgentData(): NavigatorUAData | undefined {
  return (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
}

// Values are serialized the way the browser would send them in the matching Sec-CH-UA-* header:
// booleans as ?1/?0 and lists as quoted structured-header entries. Plain strings are sent as is.
function brandList(brands?: { brand: string; version: string }[]) {
  return brands?.map(({ brand, version }) => `"${brand}";v="${version}"`).join(", ");
}

function boolHint(value?: boolean) {
  return value === undefined ? undefined : value ? "?1" : "?0";
}

function quotedList(values?: string[]) {
  return values?.map((value) => `"${value}"`).join(", ");
}

/**
 * getClientHints returns the browser's client hints keyed by their HTTP header names.
 * Only what the browser actually exposes is included: browsers without the API, or a user agent
 * that declines high entropy values, yield an empty object rather than invented values.
 */
export async function getClientHints(): Promise<Record<string, string>> {
  const uaData = userAgentData();
  if (!uaData) {
    return {};
  }

  let highEntropy: Awaited<ReturnType<NonNullable<NavigatorUAData["getHighEntropyValues"]>>> = {};
  if (uaData.getHighEntropyValues) {
    try {
      highEntropy = await uaData.getHighEntropyValues(HIGH_ENTROPY_HINTS);
    } catch {
      highEntropy = {};
    }
  }

  const hints: Record<string, [string | undefined]> = {
    "Sec-CH-UA": [brandList(highEntropy.brands ?? uaData.brands)],
    "Sec-CH-UA-Arch": [highEntropy.architecture],
    "Sec-CH-UA-Bitness": [highEntropy.bitness],
    "Sec-CH-UA-Form-Factors": [quotedList(highEntropy.formFactors)],
    "Sec-CH-UA-Full-Version": [highEntropy.uaFullVersion],
    "Sec-CH-UA-Full-Version-List": [brandList(highEntropy.fullVersionList)],
    "Sec-CH-UA-Mobile": [boolHint(highEntropy.mobile ?? uaData.mobile)],
    "Sec-CH-UA-Model": [highEntropy.model],
    "Sec-CH-UA-Platform": [highEntropy.platform ?? uaData.platform],
    "Sec-CH-UA-Platform-Version": [highEntropy.platformVersion],
    "Sec-CH-UA-WoW64": [boolHint(highEntropy.wow64)],
  };

  return Object.entries(hints).reduce<Record<string, string>>((collected, [name, [value]]) => {
    if (value !== undefined && value !== "") {
      collected[name] = value;
    }

    return collected;
  }, {});
}

export async function getDeviceData() {
  const clientHints = await getClientHints();

  return {
    device: {
      type: getDeviceType(),
      browser: {
        platform: userAgentData()?.platform ?? navigator.platform ?? "unknown",
        acceptHeader: "application/json",
        userAgent: navigator.userAgent,
        // browsers without the client hints API send nothing rather than an empty object
        ...(Object.keys(clientHints).length > 0 ? { clientHints } : {}),
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
