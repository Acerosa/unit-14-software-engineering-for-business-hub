const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { beforeEach } = require("node:test");
const vm = require("node:vm");

const engine = require("../content/engine/index.js");

function loadCore() {
  if (globalThis.LearningPlatformCore) return;
  const source = fs.readFileSync(
    path.join(__dirname, "../vendor/learning-platform-core/0.2.0/learning-platform-core.iife.js"),
    "utf8"
  );
  vm.runInThisContext(source + "\n;globalThis.LearningPlatformCore = LearningPlatformCore;");
}

const local = {
  hubCode: "unit-14-software-engineering-for-business",
  courseKey: "ocr-level-3-it",
  packageVersion: "0.1.0",
  schemaVersion: "0.1.0",
  contentPackageVersion: "0.1.0"
};

beforeEach(function () {
  engine.setPublicationState(null);
});

function row(overrides) {
  return Object.assign({
    hub_code: "unit-14-software-engineering-for-business",
    course_key: "ocr-level-3-it",
    package_version: "0.1.0",
    schema_version: "0.1.0",
    source_package_version: "0.1.0",
    published_at: "2026-08-13T12:00:00Z"
  }, overrides);
}

test("MATCHED when local package version equals the published backend version", function () {
  const state = engine.resolvePublicationState(local, [row()]);
  assert.equal(state.state, "MATCHED");
  assert.equal(state.allowsSubmission, true);
  assert.equal(state.publication.packageVersion, "0.1.0");
  assert.doesNotMatch(engine.renderPublicationStatus(state), /content hash|RLS|RPC|schema validation/i);
  assert.match(engine.renderPublicationStatus(state), /visually-hidden/);
  assert.match(engine.renderPublicationStatus(state), /data-publication-state="MATCHED"/);
});

test("NO_PUBLICATION when the backend has no current row for this hub and course", function () {
  const state = engine.resolvePublicationState(local, []);
  assert.equal(state.state, "NO_PUBLICATION");
  assert.equal(state.allowsSubmission, false);
  assert.match(state.message, /not officially published/);
});

test("LOCAL_BEHIND when the backend published version is newer", function () {
  const state = engine.resolvePublicationState(local, [row({ package_version: "0.1.1" })]);
  assert.equal(state.state, "LOCAL_BEHIND");
  assert.equal(state.allowsSubmission, false);
  assert.match(engine.renderPublicationStatus(state), /Update pending/);
});

test("LOCAL_AHEAD when the hub package is newer than the published version", function () {
  const state = engine.resolvePublicationState(
    Object.assign({}, local, { packageVersion: "0.2.0" }),
    [row()]
  );
  assert.equal(state.state, "LOCAL_AHEAD");
  assert.equal(state.allowsSubmission, false);
  assert.match(engine.renderPublicationStatus(state), /Preview/);
});

test("INCOMPATIBLE when schema or content package versions are unsupported", function () {
  const schema = engine.resolvePublicationState(local, [row({ schema_version: "9.9.9" })]);
  const source = engine.resolvePublicationState(local, [row({ source_package_version: "9.9.9" })]);
  const localSchema = engine.resolvePublicationState(
    Object.assign({}, local, { schemaVersion: "2.0.0" }),
    [row()]
  );
  assert.equal(schema.state, "INCOMPATIBLE");
  assert.equal(source.state, "INCOMPATIBLE");
  assert.equal(localSchema.state, "INCOMPATIBLE");
  assert.equal(schema.allowsSubmission, false);
});

test("ERROR when publication lookup fails", function () {
  const state = engine.resolvePublicationState(local, [], true);
  assert.equal(state.state, "ERROR");
  assert.equal(state.allowsSubmission, false);
  assert.match(engine.renderPublicationStatus(state), /Temporarily unable to save progress/);
  assert.doesNotMatch(engine.renderPublicationStatus(state), /content hash|RLS|RPC/i);
});

test("lookup uses the approved api RPC and never asks for a package body", async function () {
  const calls = [];
  const rows = [row()];
  const state = await engine.lookupPublicationState({
    local: local,
    config: {
      projectUrl: "https://example.supabase.co",
      publishableKey: "sb_publishable_example"
    },
    fetch: function (url, options) {
      calls.push({ url: url, options: options });
      return Promise.resolve({
        ok: true,
        json: function () { return Promise.resolve(rows); }
      });
    }
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.supabase.co/rest/v1/rpc/published_curriculum");
  assert.equal(calls[0].options.headers["Content-Profile"], "api");
  assert.equal(calls[0].options.headers["Accept-Profile"], "api");
  assert.equal(calls[0].options.body, "{}");
  assert.doesNotMatch(JSON.stringify(calls[0]), /package\b|author|reviewer|notes/);
  assert.equal(state.state, "MATCHED");
  assert.equal(engine.getPublicationState().state, "MATCHED");
});

test("lookup failure becomes ERROR without throwing", async function () {
  const state = await engine.lookupPublicationState({
    local: local,
    config: {
      projectUrl: "https://example.supabase.co",
      publishableKey: "sb_publishable_example"
    },
    fetch: function () {
      return Promise.resolve({ ok: false });
    }
  });
  assert.equal(state.state, "ERROR");
});

test("authoritative submission is blocked unless the publication is MATCHED", async function () {
  loadCore();
  const captured = [];
  const activity = {
    id: "week-1-baseline-diagnostic",
    version: "0.1.0",
    blocks: [{ id: "q1", type: "single-choice", content: { questionId: "u14-w1-base-q1" } }]
  };
  const draft = { responses: { "u14-w1-base-q1": "a" } };
  const platform = {
    auth: { isSignedIn: function () { return true; } },
    submission: {
      submit: function (payload) {
        captured.push(payload);
        return Promise.resolve({ ok: true });
      }
    }
  };

  const blocked = await engine.submitActivityDraft(activity, draft, {
    platform: platform,
    publication: engine.resolvePublicationState(local, [])
  });
  assert.equal(blocked.status, "local");
  assert.equal(captured.length, 0);
  assert.match(blocked.reason, /not officially published/);

  const allowed = await engine.submitActivityDraft(activity, draft, {
    platform: platform,
    publication: engine.resolvePublicationState(local, [row()])
  });
  assert.equal(allowed.status, "submitted");
  assert.equal(captured.length, 1);
  assert.equal(captured[0].activityKey, "week-1-baseline-diagnostic");
  assert.equal(captured[0].activityVersion, "0.1.0");
});

test("public week rendering does not depend on publication lookup", function () {
  engine.setPublicationState(engine.resolvePublicationState(local, [], true));
  const pkg = engine.loadPackageFromDirectory(path.join(__dirname, "../content/unit-14"));
  const html = engine.renderWeek(engine.resolveWeek(pkg, "week-1"), { root: "../.." });
  assert.match(html, /Session 1/);
  assert.match(html, /data-lp-block="single-choice"/);
  assert.equal(engine.getPublicationState().state, "ERROR");
  assert.equal(engine.getPublicationState().allowsSubmission, false);
});

test("blocked submission preserves the existing draft store", function () {
  const activity = {
    id: "week-1-draft-keep",
    version: "0.1.0",
    blocks: []
  };
  const storage = engine.createMemoryStorage();
  const store = engine.createDraftStore(activity, { storage: storage, learnerKey: "guest" });
  const draft = store.load();
  draft.responses.note = "Keep this practise work.";
  store.save(draft);
  engine.setPublicationState(engine.resolvePublicationState(local, []));
  assert.equal(engine.getPublicationState().allowsSubmission, false);
  const restored = store.load();
  assert.equal(restored.responses.note, "Keep this practise work.");
  assert.equal(restored.activityId, activity.id);
});

test("local package version and Week 1 activity versions are separate", function () {
  const pkg = engine.loadPackageFromDirectory(path.join(__dirname, "../content/unit-14"));
  const context = engine.localPublicationContext(pkg, {
    hubId: "unit-14-software-engineering-for-business",
    courseKey: "ocr-level-3-it",
    curriculumVersion: pkg.version,
    schemaVersion: pkg.schemaVersion,
    contentPackageVersion: "0.1.0"
  });
  const diagnostic = pkg.activities.filter(function (item) { return item.id === "week-1-baseline-diagnostic"; })[0];
  assert.equal(context.packageVersion, "0.1.0");
  assert.equal(context.schemaVersion, "0.1.0");
  assert.equal(diagnostic.version, "0.1.0");
  assert.equal(diagnostic.id, "week-1-baseline-diagnostic");
});

test("historical progress reads are unchanged by publication state", function () {
  const source = fs.readFileSync(path.join(__dirname, "../content/engine/publication.js"), "utf8")
    + fs.readFileSync(path.join(__dirname, "../content/engine/submit.js"), "utf8")
    + fs.readFileSync(path.join(__dirname, "../js/core/shell.js"), "utf8");
  assert.doesNotMatch(source, /my_attempts|invalidate|delete.*attempt/i);
  assert.match(source, /published_curriculum/);
  assert.match(source, /lp:publication-resolved/);
  assert.doesNotMatch(source, /createClient\(/);
});
