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
