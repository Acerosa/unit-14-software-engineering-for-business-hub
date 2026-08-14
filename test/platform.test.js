const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function run(window, file) {
  const context = vm.createContext({
    window,
    document: window.document,
    console,
    Object,
    Promise
  });
  vm.runInContext(read(file), context, { filename: file });
  return window;
}

test("hub configuration matches the canonical manifest contracts", function () {
  const window = {};
  run(window, "js/config/app-config.js");
  const manifest = JSON.parse(read("learning-platform-hub.json"));

  assert.equal(window.APP_CONFIG.hubId, manifest.hubId);
  assert.equal(window.APP_CONFIG.hubVersion, manifest.version);
  assert.equal(window.APP_CONFIG.courseKey, manifest.courses[0]);
  assert.equal(window.APP_CONFIG.curriculumVersion, "0.1.0");
  assert.equal(window.APP_CONFIG.schemaVersion, "0.1.0");
  assert.equal(window.APP_CONFIG.contentPackageVersion, "0.1.0");
  assert.equal(window.APP_CONFIG.coreVersion, manifest.compatibility.required.coreVersion);
  assert.equal(window.APP_CONFIG.learnerApiContractVersion, manifest.compatibility.required.learnerApiContractVersion);
  assert.equal(window.APP_CONFIG.submissionContractVersion, manifest.compatibility.required.submissionContractVersion);
  assert.match(read("src/config.ts"), /hubId: "unit-14-software-engineering-for-business"/);
  assert.match(read("src/platform.ts"), /navigationMode: "as-supplied"/);
  assert.deepEqual(
    JSON.parse(JSON.stringify(window.APP_CONFIG.features)),
    manifest.featureFlags
  );
  assert.equal(manifest.certification.status, "not-certified");
  assert.deepEqual(manifest.courses, ["ocr-level-3-it"]);
});

test("the composition root creates and initialises exactly one Core platform", async function () {
  let options;
  let initialisations = 0;
  const platform = {
    initialise() {
      initialisations += 1;
      return Promise.resolve({ status: "signed-out" });
    }
  };
  const { createHubPlatform } = require("../js/core/create-hub-platform.js");
  const created = createHubPlatform(function (value) {
    options = value;
    return platform;
  }, {
    root: ".",
    config: {
      hubId: "unit-14-software-engineering-for-business",
      siteName: "Unit 14 Software Engineering for Business Hub",
      coreVersion: "0.1.0",
      navigation: [{ id: "home", label: "Home", path: "" }],
      features: { authentication: true },
      theme: { primary: "#1e3a5f", accent: "#2a7a62" }
    },
    supabase: {
      projectUrl: "https://example.supabase.co",
      publishableKey: "sb_publishable_example"
    }
  });
  await created.initialise();

  assert.equal(initialisations, 1);
  assert.equal(options.hubCode, "unit-14-software-engineering-for-business");
  assert.equal(options.supabase.publishableKey, "sb_publishable_example");
  assert.equal(options.accountPath, "./account/");
  assert.equal(options.navigationMode, "as-supplied");
  assert.ok(!Object.prototype.hasOwnProperty.call(options.supabase, "serviceRoleKey"));
});

test("the reviewed hub manifest validates against the backend schema", function () {
  const validator = path.resolve(root, "../learning-platform-backend/scripts/import/validate-hub-manifest.py");
  const reviewed = path.resolve(
    root,
    "../learning-platform-backend/supabase/data/manifests/hubs/unit-14-software-engineering-for-business/learning-platform-hub.json"
  );
  assert.equal(fs.existsSync(validator), true, "backend validator must be available as a sibling repository");
  assert.equal(fs.existsSync(reviewed), true, "reviewed backend hub manifest must exist");
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(root, "learning-platform-hub.json"), "utf8")),
    JSON.parse(fs.readFileSync(reviewed, "utf8"))
  );
  const result = spawnSync("python3", [validator, reviewed], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Hub manifest validation passed/);
});
