import pkg from "../package.json";

const shortName = pkg.name.replace(/^@[^/]+\//, "");

export const SDK_HEADER_NAME = "X-Finteqhub-SDK";
export const SDK_HEADER_VALUE = `${shortName}/${pkg.version}`;