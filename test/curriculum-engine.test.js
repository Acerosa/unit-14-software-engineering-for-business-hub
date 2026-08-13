const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const engine = require("../content/engine/index.js");

const packageDir = path.join(__dirname, "../content/unit-14");
const fixtureDir = path.join(__dirname, "../content/fixtures/excel");

function loadCsvSheets() {
  const sheets = {};
  fs.readdirSync(fixtureDir).forEach(function (filename) {
    if (!filename.endsWith(".csv")) return;
    sheets[filename.replace(/\.csv$/, "")] = fs.readFileSync(path.join(fixtureDir, filename), "utf8");
  });
  return sheets;
}

function validHub() {
  return {
    schema: "lp.content.hub",
    schemaVersion: "0.1.0",
    id: "demo-hub",
    version: "0.1.0",
    metadata: { name: "Demo Hub" },
    relationships: { curriculum: "demo-curriculum" }
  };
}

function validCurriculum() {
  return {
    schema: "lp.content.curriculum",
    schemaVersion: "0.1.0",
    id: "demo-curriculum",
    version: "0.1.0",
    metadata: { title: "Demo", course: "demo-course" },
    relationships: {
      learningOutcomes: ["LO1"],
      assignments: ["A1"],
      weeks: ["week-1"]
    }
  };
}

test("Unit 14 curriculum package loads and validates", function () {
  const result = engine.validateDirectory(packageDir);
  assert.equal(result.valid, true, engine.formatIssues(result.issues));
  assert.equal(result.package.weeks.length, 19);
  assert.equal(result.package.sessions.length, 3);
  assert.equal(result.package.activities.length, 11);
  assert.equal(result.package.hub.relationships.curriculum, "u14-curriculum");
});

test("curriculum, week, session, activity and block loading follow the contract", function () {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  const week = engine.resolveWeek(pkg, "week-1");
  assert.ok(week);
  assert.equal(week.document.metadata.title, "Programming for Business, Variables and Data Types");
  assert.equal(week.sessions.length, 3);
  assert.equal(week.sessions[0].document.metadata.title, "Session 1");
  assert.equal(week.sessions[0].activities.length, 5);
  assert.equal(week.sessions[0].activities[0].document.id, "week-1-baseline-diagnostic");
  assert.ok(week.sessions[0].activities[0].document.blocks.length >= 1);
  assert.equal(week.sessions[0].activities[0].document.blocks[0].type, "heading");
});

test("the week renderer emits sessions from data rather than hard-coded HTML", function () {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  const html = engine.renderWeek(engine.resolveWeek(pkg, "week-1"), { root: "../.." });
  assert.match(html, /Session 1/);
  assert.match(html, /Session 2/);
  assert.match(html, /Directed independent study/);
  assert.match(html, /Baseline programming diagnostic/);
  assert.match(html, /GitHub Classroom/);
  assert.match(html, /role="status"/);
  assert.match(html, /Python/);
  assert.doesNotMatch(html, /<script>/);
});

test("planned weeks render from the registry without invented sessions", function () {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  const html = engine.renderWeek(engine.resolveWeek(pkg, "week-2"), { root: "../.." });
  assert.match(html, /Planned teaching week/);
  assert.doesNotMatch(html, /lp-session/);
  assert.doesNotMatch(html, /week-1-session-1/);
});

test("duplicate ids are rejected", function () {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  pkg.weeks.push(JSON.parse(JSON.stringify(pkg.weeks[0])));
  const result = engine.validatePackage(pkg);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(function (item) { return item.code === "DUPLICATE_ID"; }));
});

test("broken references are rejected", function () {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  pkg.curriculum.relationships.weeks.push("week-missing");
  const result = engine.validatePackage(pkg);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(function (item) { return item.code === "MISSING_REFERENCE"; }));
});

test("unsupported block types are rejected", function () {
  const issues = engine.validateDocument({
    schema: "lp.content.activity",
    schemaVersion: "0.1.0",
    id: "bad-activity",
    version: "0.1.0",
    metadata: { title: "Bad", status: "planned" },
    relationships: {},
    blocks: [{ id: "b1", type: "flash-game", content: {} }]
  });
  assert.ok(issues.some(function (item) { return item.code === "UNSUPPORTED_BLOCK_TYPE"; }));
});

test("unsupported schema versions are rejected", function () {
  const issues = engine.validateDocument({
    schema: "lp.content.week",
    schemaVersion: "9.0.0",
    id: "week-x",
    version: "0.1.0",
    metadata: { teachingWeek: 1, title: "X", status: "planned" },
    relationships: { learningOutcomes: ["LO1"] }
  }, "lp.content.week");
  assert.ok(issues.some(function (item) { return item.code === "UNSUPPORTED_VERSION"; }));
});

test("cyclic activity prerequisites are rejected", function () {
  function activity(id, prereq) {
    return {
      schema: "lp.content.activity",
      schemaVersion: "0.1.0",
      id: id,
      version: "0.1.0",
      metadata: { title: id, status: "planned" },
      relationships: { prerequisites: [prereq] },
      blocks: [{ id: id + "-p", type: "paragraph", content: { text: "x" } }]
    };
  }
  const result = engine.validatePackage({
    hub: validHub(),
    curriculum: validCurriculum(),
    learningOutcomes: [{
      schema: "lp.content.learning-outcome",
      schemaVersion: "0.1.0",
      id: "LO1",
      version: "0.1.0",
      metadata: { title: "Demo" },
      relationships: {}
    }],
    assignments: [{
      schema: "lp.content.assignment",
      schemaVersion: "0.1.0",
      id: "A1",
      version: "0.1.0",
      metadata: { title: "A1", status: "planned" },
      relationships: { learningOutcomes: ["LO1"], weeks: ["week-1"] }
    }],
    weeks: [{
      schema: "lp.content.week",
      schemaVersion: "0.1.0",
      id: "week-1",
      version: "0.1.0",
      metadata: { teachingWeek: 1, title: "One", status: "planned" },
      relationships: { learningOutcomes: ["LO1"], assignment: "A1", sessions: [] }
    }],
    sessions: [],
    activities: [activity("act-a", "act-b"), activity("act-b", "act-a")],
    questions: [],
    assets: []
  });
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(function (item) { return item.code === "CYCLIC_REFERENCE"; }));
});

test("Excel CSV sheets import into canonical objects then render", function () {
  const pkg = engine.importFromCsvSheets(loadCsvSheets(), validHub(), validCurriculum());
  const result = engine.validatePackage(pkg);
  assert.equal(result.valid, true, engine.formatIssues(result.issues));
  const html = engine.renderWeek(engine.resolveWeek(pkg, "week-1"), { root: "." });
  assert.match(html, /Session 1/);
  assert.match(html, /Baseline check/);
});

test("unimplemented registered blocks render as placeholders", function () {
  const html = engine.renderBlock({
    id: "q1",
    type: "multiple-choice",
    content: {}
  });
  assert.match(html, /multiple-choice/);
  assert.match(html, /not enabled yet/i);
});

test("the renderer does not know Unit 14 identifiers", function () {
  const source = fs.readFileSync(
    path.join(__dirname, "../vendor/learning-platform-content/0.1.0/learning-platform-content.iife.js"),
    "utf8"
  );
  assert.doesNotMatch(source, /Unit 14|H\/507\/5017|ocr-level-3-it/i);
});
