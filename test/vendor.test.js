const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("the hub vendors reviewed Core 0.1.0 assets and records provenance", function () {
  const vendor = path.join(root, "vendor/learning-platform-core/0.1.0");
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
  assert.match(provenance, /f484b2d545cb36b086723b6ec1dcfd135c5c1678/);
  assert.match(provenance, /0\.1\.0/);
});

test("static GitHub Pages markers are present", function () {
  assert.equal(fs.existsSync(path.join(root, ".nojekyll")), true);
  const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.doesNotMatch(home, /href="\//);
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
  assert.match(provenance, /fd4e307da96a417110674552bbadf8c705334af4/);
  assert.match(provenance, /0\.1\.0/);
});
