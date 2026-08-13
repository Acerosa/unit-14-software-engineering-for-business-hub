const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const engine = require("../content/engine/index.js");

const packageDir = path.join(__dirname, "../content/unit-14");
const engineDir = path.join(__dirname, "../content/engine");

function loadCore() {
  if (globalThis.LearningPlatformCore) return;
  const source = fs.readFileSync(
    path.join(__dirname, "../vendor/learning-platform-core/0.1.0/learning-platform-core.iife.js"),
    "utf8"
  );
  vm.runInThisContext(source + "\n;globalThis.LearningPlatformCore = LearningPlatformCore;");
}

function weekHtml() {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  return engine.renderWeek(engine.resolveWeek(pkg, "week-1"), { root: "../.." });
}

function readEngine(filename) {
  return fs.readFileSync(path.join(engineDir, filename), "utf8");
}

test("required interactive block types are registered", function () {
  [
    "single-choice",
    "classification",
    "short-response",
    "code-editor",
    "python-exercise",
    "reflection"
  ].forEach(function (type) {
    const record = engine.getBlockType(type);
    assert.ok(record, type);
    assert.equal(record.implemented, true);
    assert.equal(engine.isInteractiveBlockType(type), true);
  });
});

test("duplicate block type registrations are rejected", function () {
  assert.throws(function () {
    engine.registerBlockType("single-choice", "question", true);
  }, function (error) {
    return error && error.code === "DUPLICATE_BLOCK_TYPE";
  });
});

test("unknown block types render safely and fail validation", function () {
  const html = engine.renderBlock({ id: "x", type: "unknown-widget", content: {} });
  assert.match(html, /Unsupported block type/);
  const issues = engine.validateDocument({
    schema: "lp.content.activity",
    schemaVersion: "0.1.0",
    id: "bad",
    version: "0.1.0",
    metadata: { title: "Bad", status: "planned" },
    relationships: {},
    blocks: [{ id: "b1", type: "unknown-widget", content: {} }]
  });
  assert.ok(issues.some(function (item) { return item.code === "UNSUPPORTED_BLOCK_TYPE"; }));
});

test("Week 1 interactive blocks render with accessible controls", function () {
  const html = weekHtml();
  assert.match(html, /data-lp-block="single-choice"/);
  assert.match(html, /type="radio"/);
  assert.match(html, /data-lp-block="classification"/);
  assert.match(html, /<select /);
  assert.match(html, /data-lp-block="short-response"/);
  assert.match(html, /data-lp-block="code-editor"/);
  assert.match(html, /data-lp-block="python-exercise"/);
  assert.match(html, /data-lp-block="reflection"/);
  assert.match(html, /<label class="lp-label" for="lp-code-/);
  assert.match(html, /Reset activity/);
  assert.match(html, /Reset code/);
  assert.match(html, /role="status"/);
  assert.match(html, /Tab moves to the next control/);
  assert.doesNotMatch(html, /<select[^>]*language|JavaScript|C#/);
});

test("python exercises stay python-only and do not execute code", function () {
  const html = engine.renderBlock({
    id: "ex1",
    type: "python-exercise",
    content: {
      questionId: "q-ex",
      instructions: "Write input and print.",
      starter: "print(1)",
      checks: { required: [{ pattern: "print", label: "print()" }] }
    }
  });
  assert.match(html, />python</);
  assert.doesNotMatch(html, /javascript|csharp|c#/i);
  const engineSource = ["checks.js", "interactive.js", "render.js"].map(readEngine).join("\n");
  assert.doesNotMatch(engineSource, /\beval\s*\(|new Function\s*\(|document\.write/);
});

test("drafts persist, restore, and reset only the intended activity", function () {
  const storage = engine.createMemoryStorage();
  const first = {
    id: "week-1-baseline-diagnostic",
    version: "0.1.0",
    blocks: [{ id: "q", type: "single-choice", content: { questionId: "u14-w1-base-q1" } }]
  };
  const second = {
    id: "week-1-business-data-explorer",
    version: "0.1.0",
    blocks: [{ id: "c", type: "classification", content: { questionId: "u14-w1-biz-class" } }]
  };
  const storeA = engine.createDraftStore(first, { storage: storage, learnerKey: "guest" });
  const storeB = engine.createDraftStore(second, { storage: storage, learnerKey: "guest" });
  storeA.save({
    activityId: first.id,
    activityVersion: first.version,
    responses: { "u14-w1-base-q1": "a" },
    checked: {},
    completed: false
  });
  storeB.save({
    activityId: second.id,
    activityVersion: second.version,
    responses: { "u14-w1-biz-class": { "customer-name": "string" } },
    checked: {},
    completed: false
  });
  assert.equal(storeA.load().responses["u14-w1-base-q1"], "a");
  assert.equal(storeB.load().responses["u14-w1-biz-class"]["customer-name"], "string");
  storeA.reset();
  assert.deepEqual(storeA.load().responses, {});
  assert.equal(storeB.load().responses["u14-w1-biz-class"]["customer-name"], "string");
  assert.notEqual(storeA.key, storeB.key);
});

test("short-response and reflection complete without fabricating a grade", function () {
  const written = engine.markBlock({
    type: "short-response",
    content: { guidance: "Prices may include pence." }
  }, "A price can include 12.50");
  assert.equal(written.complete, true);
  assert.equal(written.correct, null);
  assert.match(written.feedback, /pence/);
  const empty = engine.markBlock({ type: "reflection", content: {} }, "  ");
  assert.equal(empty.complete, false);
  assert.equal(empty.correct, null);
});

test("python checks use deterministic patterns, not execution", function () {
  const block = {
    type: "python-exercise",
    content: {
      checks: {
        required: [{ pattern: "input\\s*\\(", label: "input()" }, { pattern: "print\\s*\\(", label: "print()" }]
      }
    }
  };
  const pass = engine.markBlock(block, "name = input(\"n: \")\nprint(name)");
  const fail = engine.markBlock(block, "print(\"hello\")");
  assert.equal(pass.correct, true);
  assert.equal(fail.correct, false);
});

test("Week 1 activities validate against LO1, A1 and P1", function () {
  const result = engine.validateDirectory(packageDir);
  assert.equal(result.valid, true, engine.formatIssues(result.issues));
  const pkg = result.package;
  const week = engine.resolveWeek(pkg, "week-1");
  assert.deepEqual(week.document.relationships.learningOutcomes, ["LO1"]);
  assert.equal(week.document.relationships.assignment, "A1");
  assert.equal(week.assignment.metadata.criteria[0].id, "P1");
  const activityIds = [];
  week.sessions.forEach(function (session) {
    session.activities.forEach(function (activity) {
      const doc = activity.document;
      activityIds.push(doc.id);
      assert.ok(doc.relationships.learningOutcomes.indexOf("LO1") !== -1, doc.id);
      assert.equal(doc.relationships.assignment, "A1");
      assert.ok(doc.relationships.criteria.indexOf("P1") !== -1);
      assert.equal(doc.metadata.status, "available");
    });
  });
  assert.deepEqual(activityIds, [
    "week-1-baseline-diagnostic",
    "week-1-business-data-explorer",
    "week-1-variables-and-data-types",
    "week-1-input-and-output",
    "week-1-github-classroom-guidance",
    "week-1-review",
    "week-1-guided-business-data",
    "week-1-first-commits",
    "week-1-first-python-business-program",
    "week-1-assignment-1-guide",
    "week-1-homework-extension"
  ]);
});

test("Week 1 question ids are unique and only registered block types are used", function () {
  const pkg = engine.loadPackageFromDirectory(packageDir);
  const week = engine.resolveWeek(pkg, "week-1");
  const questionIds = {};
  week.sessions.forEach(function (session) {
    session.activities.forEach(function (activity) {
      activity.document.blocks.forEach(function (block) {
        assert.equal(engine.isRegisteredBlockType(block.type), true, block.type);
        const qid = block.content && block.content.questionId;
        if (!qid) return;
        assert.equal(Object.prototype.hasOwnProperty.call(questionIds, qid), false, qid);
        questionIds[qid] = block.id;
      });
    });
  });
  assert.ok(Object.keys(questionIds).length >= 20);
});

test("submission uses Core evidence fields and never sends learner identity", async function () {
  loadCore();
  const captured = [];
  const activity = {
    id: "week-1-business-data-explorer",
    version: "0.1.0",
    blocks: [{
      id: "w1-biz-class",
      type: "classification",
      content: { questionId: "u14-w1-biz-class" }
    }]
  };
  const draft = {
    startedAt: "2026-08-13T10:00:00.000Z",
    completedAt: "2026-08-13T10:05:00.000Z",
    responses: { "u14-w1-biz-class": { "customer-name": "string" } }
  };
  const result = await engine.submitActivityDraft(activity, draft, {
    sourcePage: "/weeks/week-1/",
    platform: {
      auth: { isSignedIn: function () { return true; } },
      submission: {
        submit: function (payload) {
          captured.push(payload);
          return Promise.resolve({ ok: true });
        }
      }
    }
  });
  assert.equal(result.status, "submitted");
  assert.equal(captured.length, 1);
  assert.equal(captured[0].activityKey, "week-1-business-data-explorer");
  assert.equal(captured[0].programmingLanguage, "python");
  assert.equal(captured[0].learnerId, undefined);
  assert.equal(captured[0].enrolmentId, undefined);
  assert.equal(captured[0].assignmentId, undefined);
  assert.equal(captured[0].attemptNumber, undefined);
  const serialised = engine.serialiseActivityResult(activity, draft);
  assert.equal(serialised.activityId, activity.id);
  assert.equal(serialised.responses[0].type, "classification");
});

test("guests keep drafts locally when submission is unavailable", async function () {
  const activity = {
    id: "week-1-assignment-1-guide",
    version: "0.1.0",
    blocks: [{ id: "note", type: "reflection", content: { questionId: "u14-w1-a1-notes" } }]
  };
  const result = await engine.submitActivityDraft(activity, {
    responses: { "u14-w1-a1-notes": "A variable stores a value." }
  }, {
    platform: { auth: { isSignedIn: function () { return false; } } }
  });
  assert.equal(result.status, "local");
});

test("content and engine do not award P1 or ship privileged credentials", function () {
  const hubJs = fs.readdirSync(path.join(__dirname, "../js"), { recursive: true })
    .filter(function (filename) { return String(filename).endsWith(".js"); })
    .map(function (filename) { return fs.readFileSync(path.join(__dirname, "../js", filename), "utf8"); })
    .join("\n");
  const engineJs = fs.readdirSync(engineDir)
    .filter(function (filename) { return filename.endsWith(".js"); })
    .map(readEngine)
    .join("\n");
  const content = fs.readFileSync(path.join(packageDir, "activities.json"), "utf8");
  assert.doesNotMatch(hubJs + engineJs, /service_role|sb_secret_|postgresql:\/\//);
  assert.doesNotMatch(hubJs + engineJs, /P1 awarded|award P1|criterion-award/i);
  assert.doesNotMatch(readEngine("submit.js"), /learnerId\s*:|enrolmentId\s*:|assignmentId\s*:|attemptNumber\s*:/);
  assert.match(content, /not P1 achieved/);
});
