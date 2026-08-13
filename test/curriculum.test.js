const assert = require("node:assert/strict");
const test = require("node:test");

const curriculum = require("../js/data/curriculum.js");
const assignments = require("../js/data/assignments.js");
const journey = require("../js/data/project-journey.js");

test("the curriculum registry contains exactly 19 Unit 14 weeks", function () {
  assert.equal(curriculum.weeks.length, 19);
  curriculum.weeks.forEach(function (week, index) {
    assert.equal(week.teachingWeek, index + 1);
    assert.equal(week.weekKey, "week-" + (index + 1));
    assert.equal(week.route, "weeks/week-" + (index + 1) + "/");
    assert.ok(week.title);
    assert.equal(week.weekCommencing, null);
    assert.equal(week.releaseDate, null);
    assert.equal(week.dueDate, null);
    assert.match(week.assignment, /^A[1-4]$/);
    assert.ok(week.learningOutcomes.length >= 1);
  });
});

test("week to learning-outcome mapping follows the Scheme of Learning", function () {
  const expected = {
    LO1: [1, 2, 3, 4, 5, 6],
    LO2: [7, 8, 9],
    LO3: [10, 11, 12, 13, 14, 15],
    LO4: [16, 17, 18, 19]
  };

  Object.keys(expected).forEach(function (lo) {
    const weeks = curriculum.weeks.filter(function (week) {
      return week.learningOutcomes.indexOf(lo) !== -1;
    }).map(function (week) {
      return week.teachingWeek;
    });
    assert.deepEqual(weeks, expected[lo]);
  });

  assert.equal(curriculum.getWeek(1).title, "Programming for Business, Variables and Data Types");
  assert.equal(curriculum.getWeek(1).status, "available");
  assert.equal(curriculum.getWeek(1).assignment, "A1");
  assert.ok(Array.isArray(curriculum.getWeek(1).sessions));
  assert.equal(curriculum.getWeek(1).sessions.length, 3);
});

test("assignment registry maps criteria without awarding grades", function () {
  assert.equal(assignments.assignments.length, 4);
  assert.deepEqual(
    assignments.getAssignment("A1").criteria.map(function (item) { return item.id; }),
    ["P1"]
  );
  assert.deepEqual(
    assignments.getAssignment("A2").criteria.map(function (item) { return item.id; }),
    ["P2", "M1", "D1"]
  );
  assert.deepEqual(
    assignments.getAssignment("A3").criteria.map(function (item) { return item.id; }),
    ["P3", "P4", "P5", "M2", "D2"]
  );
  assert.deepEqual(
    assignments.getAssignment("A4").criteria.map(function (item) { return item.id; }),
    ["P6", "M3"]
  );
  assignments.assignments.forEach(function (item) {
    assert.equal(item.releaseDate, null);
    assert.equal(item.dueDate, null);
    assert.match(item.evidenceNote, /not automatically|do not award|does not award|tutor-assessed/i);
  });
  assert.equal(assignments.evidenceMap.length, 4);
});

test("project journey represents the Assignments 2 to 4 lifecycle", function () {
  const titles = journey.stages.map(function (stage) { return stage.title; });
  assert.deepEqual(titles, [
    "Investigate",
    "Requirements",
    "Feasibility",
    "Plan",
    "Design",
    "Stakeholder Review",
    "Revise",
    "Build",
    "Debug",
    "Test",
    "Evaluate",
    "Demonstrate",
    "Feedback",
    "Refine"
  ]);
  assert.equal(journey.startsAtAssignment, "A2");
});
