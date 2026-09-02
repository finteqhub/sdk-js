// Syncs SDK_VERSION in src/version.ts with the version from package.json,
// so the X-Finteqhub-SDK header reports the published version (see src/version.test.ts).
const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");

const file = path.join(__dirname, "../src/version.ts");
const content = fs.readFileSync(file, "utf8");

if (!/SDK_VERSION = "[^"]*"/.test(content)) {
  console.error("sync-version: SDK_VERSION assignment not found in src/version.ts");
  process.exit(1);
}

fs.writeFileSync(file, content.replace(/SDK_VERSION = "[^"]*"/, `SDK_VERSION = "${pkg.version}"`));
console.log(`sync-version: src/version.ts set to ${pkg.version}`);
