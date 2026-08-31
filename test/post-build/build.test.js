const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const dist = path.resolve(__dirname, "../../dist");

test("the Vite production build is a static GitHub Pages site", function () {
  assert.equal(fs.existsSync(path.join(dist, ".nojekyll")), true);
  [
    "index.html",
    "weeks/index.html",
    "weeks/week-1/index.html",
    "assignments/assignment-1/index.html",
    "project/index.html",
    "content/unit-14/weeks.json",
    "content/unit-14/activities.json"
  ].forEach(function (file) {
    assert.equal(fs.existsSync(path.join(dist, file)), true, file);
  });
  const home = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  const week1 = fs.readFileSync(path.join(dist, "weeks/week-1/index.html"), "utf8");
  assert.match(home, /type="module"/);
  assert.doesNotMatch(home + week1, /express|next\/server|Server Actions/i);
  assert.match(week1, /data-lp-week="week-1"/);
  const assets = path.join(dist, "assets");
  const files = fs.readdirSync(assets).filter(function (name) { return name.endsWith(".js"); });
  assert.ok(files.length >= 1);
  const total = files.reduce(function (sum, name) {
    return sum + fs.statSync(path.join(assets, name)).size;
  }, 0);
  assert.ok(total < 900 * 1024, "learner JS should stay under 900KB uncompressed, got " + total);
  assert.doesNotMatch(files.join("\n"), /xlsx/i);
  const authoring = fs.readFileSync(path.resolve(__dirname, "../../content/unit-14/activities.json"), "utf8");
  const bundled = fs.readFileSync(path.join(dist, "content/unit-14/activities.json"), "utf8");
  assert.match(authoring, /"correctOptionId"/);
  assert.doesNotMatch(bundled, /"correctOptionId"\s*:/);
});
