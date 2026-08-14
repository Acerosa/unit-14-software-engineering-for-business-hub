const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const engine = require("../content/engine/index.js");
const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("Unit 14 adopts shared React hub UI without hub-identity branches", function () {
  const app = read("src/App.tsx");
  const weekPage = read("src/pages/WeekPage.tsx");
  const mapper = read("src/content/week-presentation.ts");
  const platform = read("src/platform.ts");
  const config = read("src/config.ts");
  const core = [app, weekPage, mapper, platform].join("\n");
  assert.match(app, /HubShell/);
  assert.match(app, /LearnerHeader/);
  assert.match(app, /from "@learning-platform\/ui"/);
  assert.match(platform, /navigationMode: "as-supplied"/);
  assert.match(weekPage, /WeekView/);
  assert.match(weekPage, /bindInteractive/);
  assert.match(weekPage, /not P1 achieved/);
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
  assert.match(weekPage, /data-lp-week="week-1"/);
  assert.match(read("src/pages/WeekPage.tsx"), /bindInteractive/);
  assert.match(read("src/pages/WeekPage.tsx"), /not P1 achieved/);
});

test("weeks index and assignment context remain visible through shared cards", function () {
  const weeksPage = read("src/pages/WeeksPage.tsx");
  const home = read("src/pages/HomePage.tsx");
  const weeks = read("weeks/index.html");
  assert.match(weeksPage, /ActivityCard/);
  assert.match(weeks, /data-page="learning"/);
  assert.match(home, /Open Week 1/);
  assert.match(home, /Assignment 1/);
  assert.doesNotMatch(read("src/App.tsx"), /if hub ===/);
});
