const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..");

const routeFiles = [
  "index.html",
  "weeks/index.html",
  "weeks/week-1/index.html",
  "weeks/week-2/index.html",
  "weeks/week-19/index.html",
  "assignments/index.html",
  "assignments/assignment-1/index.html",
  "assignments/assignment-2/index.html",
  "assignments/assignment-3/index.html",
  "assignments/assignment-4/index.html",
  "project/index.html",
  "resources/index.html",
  "help/index.html",
  "account/index.html"
];

const allWeekRoutes = Array.from({ length: 19 }, function (_value, index) {
  return "weeks/week-" + (index + 1) + "/index.html";
});

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function references(html, attribute) {
  const pattern = new RegExp(attribute + '=(["\\\'])(.*?)\\1', "gi");
  const values = [];
  let match;
  while ((match = pattern.exec(html))) {
    values.push(match[2]);
  }
  return values;
}

function assertLocalReferenceExists(route, reference) {
  if (/^(?:[a-z]+:|#|\/\/)/i.test(reference)) {
    return;
  }
  const cleanReference = reference.split(/[?#]/)[0];
  if (!cleanReference) {
    return;
  }
  let target = path.resolve(projectRoot, path.dirname(route), cleanReference);
  if (cleanReference.endsWith("/") || (fs.existsSync(target) && fs.statSync(target).isDirectory())) {
    target = path.join(target, "index.html");
  }
  assert.equal(fs.existsSync(target), true, route + " references missing local file " + reference);
}

test("all GitHub Pages foundation routes exist", function () {
  routeFiles.concat(allWeekRoutes).forEach(function (route) {
    assert.equal(fs.existsSync(path.join(projectRoot, route)), true, "missing route " + route);
  });
});

test("routes load Core in dependency order and keep GitHub Pages-relative assets", function () {
  const scripts = [
    "theme-bootstrap.js",
    "app-config.js",
    "supabase-config.js",
    "@supabase/supabase-js@2.112.3",
    "learning-platform-core.iife.js",
    "js/core/utils.js",
    "js/core/platform.js",
    "js/core/theme.js",
    "js/core/shell.js"
  ];

  allWeekRoutes.concat([
    "index.html",
    "weeks/index.html",
    "assignments/index.html",
    "assignments/assignment-1/index.html",
    "project/index.html",
    "resources/index.html",
    "help/index.html",
    "account/index.html"
  ]).forEach(function (route) {
    const html = read(route);
    let previousIndex = -1;
    scripts.forEach(function (script) {
      const scriptIndex = html.indexOf(script);
      assert.ok(scriptIndex > previousIndex, route + " must load " + script + " in order");
      previousIndex = scriptIndex;
    });
    assert.match(html, /<main\b[^>]*id="main-content"/i, route + " needs a main landmark");
    assert.match(html, /<h1\b/i, route + " needs a page heading");
    assert.match(html, /lang="en-GB"/);
    assert.match(html, /class="skip-link"/);
    assert.match(html, /data-root=/);
    references(html, "href").forEach(function (reference) {
      assertLocalReferenceExists(route, reference);
    });
    references(html, "src").forEach(function (reference) {
      assertLocalReferenceExists(route, reference);
    });
  });
});

test("direct nested Week 1 and Assignment 1 routes remain self-contained", function () {
  const week1 = read("weeks/week-1/index.html");
  const assignment1 = read("assignments/assignment-1/index.html");
  assert.match(week1, /data-root="\.\.\/\.\."/);
  assert.match(week1, /\.\.\/\.\.\/vendor\/learning-platform-core\/0\.1\.0\/theme\.css/);
  assert.match(week1, /Programming for Business, Variables and Data Types/);
  assert.match(week1, /LO1/);
  assert.match(week1, /Assignment 1/);
  assert.match(week1, /P1/);
  assert.match(week1, /GitHub Classroom/);
  assert.match(week1, /Python/);
  assert.match(assignment1, /Programming Constructs Technical Guide/);
  assert.match(assignment1, /does not award grades/i);
});

test("public configuration contains no privileged secrets", function () {
  const config = read("js/config/supabase-config.js");
  const javascript = fs.readdirSync(path.join(projectRoot, "js/core"))
    .filter(function (filename) { return filename.endsWith(".js"); })
    .map(function (filename) { return read("js/core/" + filename); })
    .join("\n");

  assert.match(config, /projectUrl:\s*"https:\/\/[a-z0-9-]+\.supabase\.co"/i);
  assert.match(config, /publishableKey:\s*"sb_publishable_/);
  assert.match(config, /apiSchema:\s*"api"/);
  assert.doesNotMatch(config + javascript, /service_role|sb_secret_|postgresql:\/\/|eyJhbGciOi/i);
  assert.doesNotMatch(javascript, /createClient\(/);
});

test("hub navigation covers the Unit 14 information architecture", function () {
  const config = read("js/config/app-config.js");
  ["home", "learning", "assignments", "project", "resources", "help", "account"].forEach(function (id) {
    assert.match(config, new RegExp('id: "' + id + '"'));
  });
  assert.match(config, /label: "Weeks"/);
  assert.doesNotMatch(config, /OCR-Style Question Practice|exam practice/i);
});
