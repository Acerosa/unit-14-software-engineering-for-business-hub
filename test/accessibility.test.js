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

  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /skip-link/);
  assert.match(css, /@media \(max-width: 48rem\)/);
  assert.match(shell, /aria-label="Main"/);
  assert.match(shell, /aria-expanded/);
  assert.match(shell, /Escape/);
  assert.match(home, /Skip to main content/);
  assert.match(week1, /role="status"/);
  assert.match(week1, /Session 1/);
  assert.match(week1, /Session 2/);
  assert.doesNotMatch(week1, /status-label-planned[^]*Planned<\/span>\s*<h3>[^<]+<\/h3>\s*<p>[^<]+<\/p>\s*<a /);
});
