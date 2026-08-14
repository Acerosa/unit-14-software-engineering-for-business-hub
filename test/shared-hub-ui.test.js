const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const engine = require("../content/engine/index.js");
const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("Unit 14 adopts shared Core chrome without hub-identity branches", function () {
  const shell = read("js/core/shell.js");
  const platform = read("js/core/platform.js");
  const page = read("js/pages/curriculum-page.js");
  const mapper = read("js/pages/week-presentation.js");
  const config = read("js/config/app-config.js");
  const core = [shell, platform, page, mapper].join("\n");
  assert.match(shell, /createNavigationShell/);
  assert.match(shell, /createBreadcrumbs/);
  assert.match(shell, /createLearnerHeader/);
  assert.match(platform, /navigationMode: "as-supplied"/);
  assert.match(page, /createWeekView/);
  assert.match(mapper, /type: "assignment"/);
  assert.match(config, /showAssignmentContext: true/);
  assert.match(config, /showExamContext: false/);
  assert.doesNotMatch(core, /if\s*\(\s*hub\s*===/);
  assert.doesNotMatch(core, /unit-3|tlevel|Cyber Security/i);
});

test("shared Week UI maps canonical Week 1 sessions, activities and assignment context", function () {
  const pkg = engine.loadPackageFromDirectory(path.join(root, "content/unit-14"));
  const resolved = engine.resolveWeek(pkg, "week-1");
  assert.ok(resolved);
  assert.equal(resolved.document.metadata.teachingWeek, 1);
  assert.equal(resolved.sessions.length, 3);
  assert.equal(resolved.sessions[0].document.metadata.kind, "session");
  assert.ok(resolved.sessions.some(function (session) {
    return session.document.metadata.kind === "independent-study";
  }));
  assert.ok(resolved.assignment);
  assert.equal(resolved.assignment.id, "A1");
  const html = engine.renderActivity(resolved.sessions[0].activities[0], { root: "../.." });
  assert.match(html, /data-lp-activity=/);
  assert.match(html, /role="status"/);
  const weekPage = read("weeks/week-1/index.html");
  assert.match(weekPage, /data-lp-view="week"/);
  assert.match(weekPage, /week-presentation\.js/);
  assert.match(read("js/pages/curriculum-page.js"), /bindInteractive/);
  assert.match(read("js/pages/curriculum-page.js"), /renderAssignmentProgress/);
  assert.match(read("js/pages/curriculum-page.js"), /not P1 achieved/);
});

test("weeks index and assignment context remain visible through shared cards", function () {
  const render = read("js/pages/render.js");
  const weeks = read("weeks/index.html");
  const home = read("index.html");
  assert.match(render, /createActivityCard/);
  assert.match(render, /badge: true/);
  assert.match(weeks, /data-week-grid/);
  assert.match(home, /Open Week 1/);
  assert.match(home, /Assignment 1/);
  assert.doesNotMatch(read("js/core/shell.js"), /if hub ===/);
});
