const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("the hub vendors reviewed Core 0.2.0 assets and records provenance", function () {
  const vendor = path.join(root, "vendor/learning-platform-core/0.2.0");
  [
    "learning-platform-core.iife.js",
    "theme.css",
    "tokens.css",
    "LICENSE",
    "PROVENANCE.md"
  ].forEach(function (filename) {
    assert.equal(fs.existsSync(path.join(vendor, filename)), true, filename);
  });
  const provenance = fs.readFileSync(path.join(vendor, "PROVENANCE.md"), "utf8");
  assert.match(provenance, /f59614ee0d77f43852f02b1eab6dfb176ddfbc40/);
  assert.match(provenance, /0\.2\.0/);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.match(pkg.dependencies["@learning-platform/core"], /learning-platform-core/);
  assert.match(pkg.dependencies["@learning-platform/ui"], /learning-platform-ui/);
  assert.match(pkg.dependencies["@learning-platform/content"], /learning-platform-content/);
});

test("static GitHub Pages markers are present", function () {
  assert.equal(fs.existsSync(path.join(root, ".nojekyll")), true);
  const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.doesNotMatch(home, /href="\//);
  assert.match(home, /src="\.\/src\/main\.tsx"/);
});

test("the hub vendors reviewed Content 0.1.0 assets and records provenance", function () {
  const vendor = path.join(root, "vendor/learning-platform-content/0.1.0");
  [
    "learning-platform-content.iife.js",
    "learning-platform-content.cjs.js",
    "LICENSE",
    "PROVENANCE.md"
  ].forEach(function (filename) {
    assert.equal(fs.existsSync(path.join(vendor, filename)), true, filename);
  });
  const provenance = fs.readFileSync(path.join(vendor, "PROVENANCE.md"), "utf8");
  assert.match(provenance, /339bbf6878dba2322f3ef208889505b1e495f27d/);
  assert.match(provenance, /Acerosa\/learning-platform-content/);
  assert.match(provenance, /v0\.1\.0/);
  assert.match(provenance, /0\.1\.0/);
});
