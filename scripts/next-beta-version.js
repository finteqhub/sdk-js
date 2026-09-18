// Prints the next `<version>-beta.<n>` for the version in package.json: one past
// the highest beta already published for that base version, or `-beta.1` when
// none exists. Used by .github/workflows/publish-beta.yml, so beta numbering
// restarts with every base version instead of following the workflow run
// counter (which produced 0.14.0-beta.6 as the first beta of 0.14.0).
const { execFileSync } = require("child_process");
const pkg = require("../package.json");

let published = [];

try {
  const output = execFileSync("npm", ["view", pkg.name, "versions", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const parsed = JSON.parse(output);
  // npm returns a bare string rather than an array when only one version exists.
  published = Array.isArray(parsed) ? parsed : [parsed];
} catch (e) {
  // Nothing published under this name yet, so the first beta starts at 1.
}

const prefix = `${pkg.version}-beta.`;
const highest = published
  .filter((version) => version.startsWith(prefix))
  .map((version) => Number(version.slice(prefix.length)))
  .filter((n) => Number.isInteger(n) && n > 0)
  .reduce((max, n) => Math.max(max, n), 0);

console.log(`${prefix}${highest + 1}`);
