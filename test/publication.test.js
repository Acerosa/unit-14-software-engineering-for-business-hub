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
  packageVersion: "0.2.0",
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
    package_version: "0.2.0",
    schema_version: "0.1.0",
    source_package_version: "0.1.0",
    published_at: "2026-08-13T12:00:00Z",
    content_hash: "abc123",
    package: {
      schema: "lp.content.package",
      schemaVersion: "0.1.0",
      id: "unit-14-software-engineering-for-business-content",
      version: "0.2.0",
      hub: { id: "unit-14-software-engineering-for-business" },
      curriculum: { metadata: { course: "ocr-level-3-it" } },
      learningOutcomes: [],
      assignments: [],
      weeks: [],
      sessions: [],
      activities: [],
      questions: [],
      assets: []
    }
  }, overrides);
}

function bundledPackage() {
  return engine.loadPackageFromDirectory(path.join(__dirname, "../content/unit-14"));
}

test("PUBLISHED when the live package is current and compatible", function () {
  const state = engine.resolvePublicationState(local, [row()]);
  assert.equal(state.state, "PUBLISHED");
  assert.equal(state.allowsSubmission, true);
  assert.equal(state.publication.packageVersion, "0.2.0");
  assert.doesNotMatch(engine.renderPublicationStatus(state), /content hash|RLS|RPC|schema validation/i);
  assert.match(engine.renderPublicationStatus(state), /visually-hidden/);
  assert.match(engine.renderPublicationStatus(state), /data-publication-state="PUBLISHED"/);
});

test("NO_PUBLICATION when the backend has no current row for this hub and course", function () {
  const state = engine.resolvePublicationState(local, []);
  assert.equal(state.state, "NO_PUBLICATION");
  assert.equal(state.allowsSubmission, false);
  assert.match(state.message, /not officially published/);
});

test("a newer published version still renders from the database package", function () {
  const state = engine.resolvePublicationState(local, [row({ package_version: "0.2.1" })]);
  assert.equal(state.state, "PUBLISHED");
  assert.equal(state.allowsSubmission, true);
  assert.doesNotMatch(engine.renderPublicationStatus(state), /Update pending/);
});

test("a bundled copy that is ahead does not block the published package", function () {
  const state = engine.resolvePublicationState(
    Object.assign({}, local, { packageVersion: "0.3.0" }),
    [row()]
  );
  assert.equal(state.state, "PUBLISHED");
  assert.equal(state.allowsSubmission, true);
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

test("runtime fetch uses the published package RPC for this hub and course", async function () {
  const calls = [];
  const published = row({ package_version: "0.2.1" });
  const runtime = await engine.loadCurriculumRuntime({
    appConfig: {
      hubId: local.hubCode,
      courseKey: local.courseKey,
      contentPackageVersion: "0.1.0"
    },
    config: {
      projectUrl: "https://example.supabase.co",
      publishableKey: "sb_publishable_example"
    },
    fetch: function (url, options) {
      calls.push({ url: url, options: options });
      return Promise.resolve({
        ok: true,
        json: function () { return Promise.resolve([published]); }
      });
    },
    loadBundled: bundledPackage,
    validate: function () { return { valid: true }; },
    storage: engine.createMemoryStorage()
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.supabase.co/rest/v1/rpc/published_curriculum_package");
  assert.equal(calls[0].options.headers["Content-Profile"], "api");
  assert.match(calls[0].options.body, /p_hub_code/);
  assert.match(calls[0].options.body, /unit-14-software-engineering-for-business/);
  assert.doesNotMatch(JSON.stringify(calls[0]), /author|reviewer|question_marking|service_role/);
  assert.equal(runtime.source, "published");
  assert.equal(runtime.state.state, "PUBLISHED");
  assert.equal(runtime.package.version, "0.2.1");
  assert.equal(engine.getPublicationState().state, "PUBLISHED");
});

test("invalid published packages fall back to the bundled snapshot", async function () {
  const runtime = await engine.loadCurriculumRuntime({
    appConfig: { hubId: local.hubCode, courseKey: local.courseKey },
    config: {
      projectUrl: "https://example.supabase.co",
      publishableKey: "sb_publishable_example"
    },
    fetch: function () {
      return Promise.resolve({
        ok: true,
        json: function () { return Promise.resolve([row({ package: { not: "a package" } })]); }
      });
    },
    loadBundled: bundledPackage,
    validate: function (pkg) {
      return { valid: Boolean(pkg && pkg.hub && pkg.curriculum && pkg.weeks) };
    },
    storage: engine.createMemoryStorage()
  });
  assert.equal(runtime.source, "bundled");
  assert.equal(runtime.state.state, "FALLBACK");
  assert.equal(runtime.package.indexFile.version, "0.2.0");
  assert.match(engine.renderPublicationStatus(runtime.state), /Saved copy/);
});

test("lookup failure uses the bundled snapshot instead of mixing versions", async function () {
  const runtime = await engine.loadCurriculumRuntime({
    appConfig: { hubId: local.hubCode, courseKey: local.courseKey },
    config: {
      projectUrl: "https://example.supabase.co",
      publishableKey: "sb_publishable_example"
    },
    fetch: function () {
      return Promise.resolve({ ok: false });
    },
    loadBundled: bundledPackage,
    validate: function () { return { valid: true }; },
    storage: engine.createMemoryStorage()
  });
  assert.equal(runtime.source, "bundled");
  assert.equal(runtime.state.state, "FALLBACK");
  assert.equal(runtime.allowsSubmission, undefined);
  assert.equal(runtime.state.allowsSubmission, false);
});

test("cached packages are namespaced by hub and course", function () {
  const storage = engine.createMemoryStorage();
  const pkg = bundledPackage();
  engine.writeCurriculumCache(storage, local.hubCode, local.courseKey, row(), pkg);
  engine.writeCurriculumCache(storage, "unit-3-cyber-security", local.courseKey, row(), { id: "other" });
  assert.equal(
    engine.curriculumCacheKey(local.hubCode, local.courseKey),
    "lp.curriculum.cache.v1:unit-14-software-engineering-for-business:ocr-level-3-it"
  );
  assert.notEqual(
    engine.curriculumCacheKey(local.hubCode, local.courseKey),
    engine.curriculumCacheKey("unit-3-cyber-security", local.courseKey)
  );
  const restored = engine.readCurriculumCache(storage, local.hubCode, local.courseKey, function () {
    return { valid: true };
  });
  assert.equal(restored.hubId, local.hubCode);
  assert.equal(restored.package.indexFile.version, "0.2.0");
  assert.equal(storage.getItem("learning-platform.content.draft.v1:guest:week-1-baseline-diagnostic"), null);
});

test("authoritative submission is blocked unless the live published package is in use", async function () {
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
  const pkg = bundledPackage();
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

test("curriculum package version and Week 1 activity versions are separate", function () {
  const pkg = bundledPackage();
  const context = engine.localPublicationContext(pkg, {
    hubId: "unit-14-software-engineering-for-business",
    courseKey: "ocr-level-3-it",
    contentPackageVersion: "0.1.0"
  });
  const diagnostic = pkg.activities.filter(function (item) { return item.id === "week-1-baseline-diagnostic"; })[0];
  assert.equal(context.packageVersion, "0.2.0");
  assert.equal(diagnostic.version, "0.1.0");
  assert.equal(diagnostic.id, "week-1-baseline-diagnostic");
});

test("historical progress reads are unchanged by publication state", function () {
  const source = fs.readFileSync(path.join(__dirname, "../content/engine/publication.js"), "utf8")
    + fs.readFileSync(path.join(__dirname, "../content/engine/submit.js"), "utf8")
    + fs.readFileSync(path.join(__dirname, "../src/App.tsx"), "utf8")
    + fs.readFileSync(path.join(__dirname, "../src/hooks/useContentPackage.ts"), "utf8");
  assert.doesNotMatch(source, /my_attempts|invalidate|delete.*attempt/i);
  assert.match(source, /published_curriculum_package/);
  assert.doesNotMatch(source, /createClient\(/);
  assert.doesNotMatch(source, /service_role|SERVICE_ROLE/);
});
