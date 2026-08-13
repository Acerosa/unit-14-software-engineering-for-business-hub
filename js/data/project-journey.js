(function (root) {
  "use strict";

  var stages = Object.freeze([
    Object.freeze({ id: "investigate", title: "Investigate", assignment: "A2", status: "planned" }),
    Object.freeze({ id: "requirements", title: "Requirements", assignment: "A2", status: "planned" }),
    Object.freeze({ id: "feasibility", title: "Feasibility", assignment: "A2", status: "planned" }),
    Object.freeze({ id: "plan", title: "Plan", assignment: "A2", status: "planned" }),
    Object.freeze({ id: "design", title: "Design", assignment: "A3", status: "planned" }),
    Object.freeze({ id: "stakeholder-review", title: "Stakeholder Review", assignment: "A3", status: "planned" }),
    Object.freeze({ id: "revise", title: "Revise", assignment: "A3", status: "planned" }),
    Object.freeze({ id: "build", title: "Build", assignment: "A3", status: "planned" }),
    Object.freeze({ id: "debug", title: "Debug", assignment: "A3", status: "planned" }),
    Object.freeze({ id: "test", title: "Test", assignment: "A3", status: "planned" }),
    Object.freeze({ id: "evaluate", title: "Evaluate", assignment: "A3", status: "planned" }),
    Object.freeze({ id: "demonstrate", title: "Demonstrate", assignment: "A4", status: "planned" }),
    Object.freeze({ id: "feedback", title: "Feedback", assignment: "A4", status: "planned" }),
    Object.freeze({ id: "refine", title: "Refine", assignment: "A4", status: "planned" })
  ]);

  var api = Object.freeze({
    title: "Unit 14 project journey",
    summary: "Assignments 2 to 4 form one continuous software-engineering project. GitHub remains the authentic development and evidence environment.",
    startsAtAssignment: "A2",
    stages: stages
  });

  root.Unit14ProjectJourney = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
