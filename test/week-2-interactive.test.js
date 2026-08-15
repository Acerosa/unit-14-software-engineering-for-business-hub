const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const engine = require("../content/engine/index.js");

const packageDir = path.join(__dirname, "../content/unit-14");
const week2Package = path.join(__dirname, "../content/packages/week-2.json");

function weekHtml() {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  return engine.renderWeek(engine.resolveWeek(pkg, "week-2"), { root: "../.." });
}

test("Week 2 package graph validates with unique ids and registered blocks", function () {
  const result = engine.validateDirectory(packageDir);
  assert.equal(result.valid, true, engine.formatIssues(result.issues));
  const week = engine.resolveWeek(result.package, "week-2");
  const ids = {};
  const questionIds = {};
  week.sessions.forEach(function (session) {
    session.activities.forEach(function (activity) {
      const doc = activity.document;
      assert.equal(Object.prototype.hasOwnProperty.call(ids, doc.id), false, doc.id);
      ids[doc.id] = true;
      assert.ok(doc.relationships.learningOutcomes.indexOf("LO1") !== -1, doc.id);
      assert.equal(doc.relationships.assignment, "A1");
      assert.ok(doc.relationships.criteria.indexOf("P1") !== -1);
      assert.equal(doc.version, "0.1.0");
      doc.blocks.forEach(function (block) {
        assert.equal(engine.isRegisteredBlockType(block.type), true, block.type);
        const qid = block.content && block.content.questionId;
        if (!qid) return;
        assert.equal(Object.prototype.hasOwnProperty.call(questionIds, qid), false, qid);
        questionIds[qid] = block.id;
      });
    });
  });
  assert.equal(Object.keys(ids).length, 13);
  assert.ok(Object.keys(questionIds).length >= 20);
});

test("Week 1 activity versions remain 0.1.0 after Week 2 authoring", function () {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  const week = engine.resolveWeek(pkg, "week-1");
  week.sessions.forEach(function (session) {
    session.activities.forEach(function (activity) {
      assert.equal(activity.document.version, "0.1.0");
      assert.match(activity.document.id, /^week-1-/);
    });
  });
});

test("Week 2 interactive blocks render with accessible controls", function () {
  const html = weekHtml();
  assert.match(html, /data-lp-block="single-choice"/);
  assert.match(html, /type="radio"/);
  assert.match(html, /data-lp-block="classification"/);
  assert.match(html, /data-lp-block="short-response"/);
  assert.match(html, /data-lp-block="code-editor"/);
  assert.match(html, /data-lp-block="python-exercise"/);
  assert.match(html, /data-lp-block="reflection"/);
  assert.match(html, /Reset activity/);
  assert.match(html, /role="status"/);
  assert.doesNotMatch(html, /<select[^>]*language|JavaScript|C#/);
  assert.doesNotMatch(html, /eval\s*\(|new Function/);
});

test("Week 2 conversion debugging includes five python exercises", function () {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  const activity = pkg.activities.find(function (item) { return item.id === "week-2-conversion-debugging"; });
  const exercises = activity.blocks.filter(function (block) { return block.type === "python-exercise"; });
  assert.equal(exercises.length, 5);
  exercises.forEach(function (block) {
    assert.equal(block.content.language, "python");
    assert.ok(block.content.checks.required.length >= 1);
  });
});

test("complete Week 2 import artefact contains the week graph", function () {
  const incoming = JSON.parse(fs.readFileSync(week2Package, "utf8"));
  assert.equal(incoming.schema, "lp.content.package");
  assert.equal(incoming.weeks.length, 1);
  assert.equal(incoming.weeks[0].id, "week-2");
  assert.equal(incoming.weeks[0].metadata.status, "available");
  assert.deepEqual(incoming.weeks[0].relationships.sessions, [
    "week-2-session-1",
    "week-2-session-2",
    "week-2-independent-study"
  ]);
  assert.equal(incoming.sessions.length, 3);
  assert.equal(incoming.activities.length, 13);
  incoming.sessions.forEach(function (session) {
    assert.equal(session.relationships.week, "week-2");
  });
});

test("Week 2 python checks stay deterministic and do not execute code", function () {
  const block = {
    type: "python-exercise",
    content: {
      language: "python",
      checks: {
        required: [{ pattern: "int\\s*\\(", label: "int()" }, { pattern: "float\\s*\\(", label: "float()" }]
      }
    }
  };
  const pass = engine.markBlock(block, "quantity = int(input(\"n: \"))\nprice = float(input(\"p: \"))");
  const fail = engine.markBlock(block, "print(\"10\" + \"5\")");
  assert.equal(pass.correct, true);
  assert.equal(fail.correct, false);
});

test("Week 2 written notes complete without fabricating a P1 grade", function () {
  const written = engine.markBlock({
    type: "reflection",
    content: {}
  }, "Conversion turns input text into a number before VAT is calculated.");
  assert.equal(written.complete, true);
  assert.equal(written.correct, null);
  const html = weekHtml();
  assert.match(html, /not P1 achieved/);
  assert.doesNotMatch(html, /P1 awarded|Pass achieved/i);
});
