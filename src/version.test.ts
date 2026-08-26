import pkg from "../package.json";
import { SDK_VERSION } from "./version";

test("SDK_VERSION matches package.json version", () => {
  expect(SDK_VERSION).toBe(pkg.version);
});
