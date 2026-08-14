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

test("routes are Vite HTML shells with GitHub Pages-relative module entries", function () {
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
    assert.match(html, /lang="en-GB"/);
    assert.match(html, /id="root"/);
    assert.match(html, /type="module"/);
    assert.match(html, /src=".*src\/main\.tsx"/);
    assert.match(html, /data-root=/);
    assert.match(html, /<noscript>/);
    assert.doesNotMatch(html, /express|next\/server|fs\.readFile/i);
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
  const week1Content = read("content/unit-14/weeks.json") + read("content/unit-14/activities.json") + read("content/unit-14/sessions.json");
  const weekCopy = read("src/page-copy.ts") + read("src/pages/HomePage.tsx") + read("src/pages/AssignmentPage.tsx");
  assert.match(week1, /data-root="\.\.\/\.\."/);
  assert.match(week1, /data-lp-view="week"/);
  assert.match(week1, /data-lp-week="week-1"/);
  assert.match(week1, /src="\.\.\/\.\.\/src\/main\.tsx"/);
  assert.match(week1, /Programming for Business, Variables and Data Types/);
  assert.match(weekCopy, /LO1/);
  assert.match(weekCopy, /Assignment 1/);
  assert.match(weekCopy, /P1/);
  assert.match(weekCopy, /GitHub Classroom/);
  assert.match(weekCopy, /Python/);
  assert.match(week1Content, /GitHub Classroom/);
  assert.match(week1Content, /Baseline programming diagnostic/);
  assert.match(assignment1, /Programming Constructs Technical Guide/);
  assert.match(read("src/pages/AssignmentPage.tsx"), /does not award Pass, Merit or Distinction/i);
});

test("public configuration contains no privileged secrets", function () {
  const config = read("js/config/supabase-config.js") + read("src/supabase-config.ts") + read("src/platform.ts");
  const javascript = fs.readdirSync(path.join(projectRoot, "src"))
    .filter(function (filename) { return filename.endsWith(".ts") || filename.endsWith(".tsx"); })
    .map(function (filename) { return read("src/" + filename); })
    .join("\n");

  assert.match(config, /projectUrl:\s*"https:\/\/[a-z0-9-]+\.supabase\.co"/i);
  assert.match(config, /publishableKey:\s*"sb_publishable_/);
  assert.match(read("js/config/supabase-config.js"), /apiSchema:\s*"api"/);
  assert.doesNotMatch(config + javascript, /service_role|sb_secret_|postgresql:\/\/|eyJhbGciOi/i);
  assert.match(read("src/platform.ts"), /createClient/);
  assert.doesNotMatch(read("src/platform.ts"), /serviceRoleKey|createClient\([^)]*secret/);
});

test("hub navigation covers the Unit 14 information architecture", function () {
  const config = read("js/config/app-config.js") + read("src/config.ts");
  ["home", "learning", "assignments", "project", "resources", "help", "account"].forEach(function (id) {
    assert.match(config, new RegExp('id: "' + id + '"'));
  });
  assert.match(config, /label: "Weeks"/);
  assert.doesNotMatch(config, /OCR-Style Question Practice|exam practice/i);
});
