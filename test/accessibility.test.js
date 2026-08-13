const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("accessibility fundamentals are present in the shell and CSS", function () {
  const css = read("css/hub.css");
  const shell = read("js/core/shell.js");
  const home = read("index.html");
  const week1 = read("weeks/week-1/index.html");
  const engine = require("../content/engine/index.js");
  const path = require("node:path");
  const pkg = engine.loadPackageFromDirectory(path.join(root, "content/unit-14"));
  const weekHtml = engine.renderWeek(engine.resolveWeek(pkg, "week-1"), { root: "../.." });

  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /skip-link/);
  assert.match(css, /@media \(max-width: 48rem\)/);
  assert.match(shell, /aria-label="Main"/);
  assert.match(shell, /aria-expanded/);
  assert.match(shell, /Escape/);
  assert.match(home, /Skip to main content/);
  assert.match(week1, /data-lp-view="week"/);
  assert.match(weekHtml, /role="status"/);
  assert.match(weekHtml, /Session 1/);
  assert.match(weekHtml, /Session 2/);
  assert.match(weekHtml, /<label class="lp-label" for=/);
  assert.match(weekHtml, /<fieldset class="lp-fieldset"><legend>/);
  assert.match(weekHtml, /Reset activity/);
  assert.match(css, /publication-banner/);
  assert.match(css, /Review\. /);
  const matchedStatus = engine.renderPublicationStatus(engine.resolvePublicationState({
    hubCode: "unit-14-software-engineering-for-business",
    courseKey: "ocr-level-3-it",
    packageVersion: "0.1.0",
    schemaVersion: "0.1.0",
    contentPackageVersion: "0.1.0"
  }, [{
    hub_code: "unit-14-software-engineering-for-business",
    course_key: "ocr-level-3-it",
    package_version: "0.1.0",
    schema_version: "0.1.0",
    source_package_version: "0.1.0",
    published_at: "2026-08-13T12:00:00Z"
  }]));
  const errorStatus = engine.renderPublicationStatus(engine.resolvePublicationState({
    hubCode: "unit-14-software-engineering-for-business",
    courseKey: "ocr-level-3-it",
    packageVersion: "0.1.0",
    schemaVersion: "0.1.0",
    contentPackageVersion: "0.1.0"
  }, [], true));
  assert.match(matchedStatus, /role="status"/);
  assert.match(matchedStatus, /visually-hidden/);
  assert.doesNotMatch(matchedStatus, /Update pending|Preview|Temporarily unable/);
  assert.match(errorStatus, /role="status"/);
  assert.match(errorStatus, /Temporarily unable to save progress/);
  assert.doesNotMatch(matchedStatus + errorStatus, /content hash|RLS|RPC|schema validation/i);
  assert.doesNotMatch(weekHtml, /status-label-planned[^]*Planned<\/span>\s*<h3>[^<]+<\/h3>\s*<p>[^<]+<\/p>\s*<a /);
});
