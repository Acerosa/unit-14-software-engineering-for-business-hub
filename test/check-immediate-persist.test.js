const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const projectRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function memoryStorage() {
  const data = {};
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; }
  };
}

function activityFixture() {
  return {
    id: "week-1-variables-and-data-types",
    version: "0.1.0",
    blocks: [{
      id: "w1-var-q1",
      type: "option-cards",
      content: {
        questionId: "u14-w1-var-q1",
        prompt: "Which type stores true or false?",
        options: [
          { id: "boolean", label: "boolean" },
          { id: "string", label: "string" }
        ]
      }
    }]
  };
}

function articleHtml(activity) {
  return `<article data-lp-activity="${activity.id}">
    <div data-lp-block-id="${activity.blocks[0].id}" data-lp-block="option-cards" data-lp-question="${activity.blocks[0].content.questionId}"></div>
    <p data-lp-activity-status role="status"></p>
  </article>`;
}

function loadBoundEngine({ saves, submits, platformOnWindow }) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/weeks/week-1/" });
  const browserWindow = dom.window;
  browserWindow.localStorage = memoryStorage();
  const platform = {
    auth: {
      isSignedIn() { return true; },
      getSession() { return { user: { id: "auth-user" } }; }
    },
    progress: {
      createStore() {
        return {
          save(draft, options) { saves.push({ draft: JSON.parse(JSON.stringify(draft)), options: options || {} }); },
          hydrate(local) { return Promise.resolve(local); },
          flush() { return Promise.resolve(null); },
          clear() { return Promise.resolve(); }
        };
      }
    }
  };
  if (platformOnWindow) browserWindow.LearningPlatform = { platform };
  const context = vm.createContext(browserWindow);
  browserWindow.globalThis = browserWindow;
  vm.runInContext(read("content/engine/version.js"), context, { filename: "content/engine/version.js" });
  vm.runInContext(read("content/engine/state.js"), context, { filename: "content/engine/state.js" });
  vm.runInContext(read("content/engine/interactive.js"), context, { filename: "content/engine/interactive.js" });
  const engine = browserWindow.LearningPlatformContent;
  engine.normaliseBlockType = function (type) { return type; };
  engine.isInteractiveBlockType = function () { return true; };
  engine.markBlock = function () { return { complete: true, feedback: "Checked." }; };
  engine.getPublicationState = function () { return { state: "PUBLISHED", allowsSubmission: true }; };
  engine.submitActivityDraft = function (activity, draft) {
    submits.push({
      activityId: activity.id,
      responses: JSON.parse(JSON.stringify(draft.responses || {})),
      checked: JSON.parse(JSON.stringify(draft.checked || {}))
    });
    return Promise.resolve({ status: "submitted" });
  };
  return { engine, document: browserWindow.document, platform };
}

function bind(extra) {
  const saves = extra?.saves || [];
  const submits = extra?.submits || [];
  const activity = extra?.activity || activityFixture();
  const { engine, document, platform } = loadBoundEngine({
    saves,
    submits,
    platformOnWindow: extra?.platformOnWindow === true
  });
  document.body.innerHTML = articleHtml(activity);
  const bindOptions = {
    storage: memoryStorage(),
    sourcePage: "/weeks/week-1/"
  };
  if (extra?.explicitPlatform !== false) bindOptions.platform = extra?.platform || platform;
  engine.bindInteractive(document.body, { activities: [activity] }, bindOptions);
  return {
    engine,
    document,
    saves,
    submits,
    platform,
    activity,
    article: document.querySelector("[data-lp-activity]"),
    qid: activity.blocks[0].content.questionId
  };
}

function dispatchResult(bound, detail) {
  bound.article.dispatchEvent(new bound.document.defaultView.CustomEvent("lp-block-result", {
    bubbles: true,
    detail
  }));
}

test("TEST A: completed Check persists current state immediately with checked response", function () {
  const bound = bind();
  dispatchResult(bound, { questionId: bound.qid, response: "boolean", completed: true });
  assert.equal(bound.saves.length, 1);
  assert.equal(bound.saves[0].options.immediate, true);
  assert.equal(bound.saves[0].draft.responses[bound.qid], "boolean");
  assert.equal(bound.saves[0].draft.checked[bound.qid], true);
  assert.equal(bound.submits.length, 1);
  assert.equal(bound.submits[0].responses[bound.qid], "boolean");
  assert.equal(bound.submits[0].checked[bound.qid], true);
});

test("TEST B: completed Check does not double-save current state", async function () {
  const bound = bind();
  dispatchResult(bound, { questionId: bound.qid, response: "boolean", completed: true });
  await new Promise((resolve) => setTimeout(resolve, 700));
  const currentStateSaves = bound.saves.filter((item) => item.options.remote !== false);
  assert.equal(currentStateSaves.length, 1);
  assert.equal(bound.saves.length, 1);
  assert.equal(bound.submits.length, 1);
});

test("TEST C: incomplete lp-block-result does not force an immediate remote write", function () {
  const bound = bind();
  dispatchResult(bound, { questionId: bound.qid, response: "boolean" });
  assert.equal(bound.saves.length, 1);
  assert.notEqual(bound.saves[0].options.immediate, true);
  assert.equal(bound.saves[0].draft.responses[bound.qid], "boolean");
  assert.equal(Boolean(bound.saves[0].draft.checked[bound.qid]), false);
  assert.equal(bound.submits.length, 0);
});

test("TEST D: Try Again remains immediate and persists exactly once", async function () {
  const bound = bind();
  dispatchResult(bound, { questionId: bound.qid, response: "boolean", completed: true });
  dispatchResult(bound, { questionId: bound.qid, response: "", completed: false });
  await new Promise((resolve) => setTimeout(resolve, 700));
  assert.equal(bound.saves.length, 2);
  assert.equal(bound.saves[1].options.immediate, true);
  assert.equal(Object.prototype.hasOwnProperty.call(bound.saves[1].draft.responses, bound.qid), false);
  assert.equal(bound.saves[1].draft.checked[bound.qid], false);
  assert.equal(bound.submits.length, 1);
});

test("TEST E: bindInteractive uses the explicit platform option, not only the window fallback", function () {
  const saves = [];
  const submits = [];
  const { engine, document, platform } = loadBoundEngine({
    saves,
    submits,
    platformOnWindow: false
  });
  const activity = activityFixture();
  document.body.innerHTML = articleHtml(activity);
  assert.equal(document.defaultView.LearningPlatform, undefined);
  engine.bindInteractive(document.body, { activities: [activity] }, {
    storage: memoryStorage(),
    platform
  });
  const article = document.querySelector("[data-lp-activity]");
  const qid = activity.blocks[0].content.questionId;
  article.dispatchEvent(new document.defaultView.CustomEvent("lp-block-result", {
    bubbles: true,
    detail: { questionId: qid, response: "boolean", completed: true }
  }));
  assert.equal(saves.length, 1);
  assert.equal(saves[0].options.immediate, true);
  assert.equal(saves[0].draft.responses[qid], "boolean");
});

test("completed Check keeps marking submit separate from the single current-state save", function () {
  const bound = bind();
  dispatchResult(bound, { questionId: bound.qid, response: "string", completed: true });
  assert.equal(bound.saves.length, 1, "current-state save once");
  assert.equal(bound.submits.length, 1, "submitActivityDraft once; marking RPC is owned by UI");
  assert.equal(bound.saves[0].options.immediate, true);
});

test("WeekPage and engine source keep immediate Check persist plus explicit platform", function () {
  const interactive = read("content/engine/interactive.js");
  const resultHandler = interactive.slice(
    interactive.indexOf('article.addEventListener("lp-block-result"'),
    interactive.indexOf('article.addEventListener("change"')
  );
  assert.match(resultHandler, /detail\.completed === false/);
  assert.match(resultHandler, /persist\(\{\s*immediate:\s*true\s*\}\)/);
  assert.match(resultHandler, /persist\(detail\.completed \? \{\s*immediate:\s*true\s*\} : undefined\)/);
  assert.match(resultHandler, /submitActivityDraft/);
  const weekPage = read("src/pages/WeekPage.tsx");
  assert.match(weekPage, /engine\.bindInteractive\(/);
  assert.match(weekPage, /platform:\s*platform \|\|/);
  assert.match(weekPage, /window\.LearningPlatform\?\.platform/);
});
