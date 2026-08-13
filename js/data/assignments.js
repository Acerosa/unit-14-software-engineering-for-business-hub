(function (root) {
  "use strict";

  function freezeList(items) {
    return Object.freeze(items.map(function (item) {
      return Object.freeze(item);
    }));
  }

  var assignments = freezeList([
    {
      id: "A1",
      key: "assignment-1",
      title: "Programming Constructs Technical Guide",
      learningOutcomes: Object.freeze(["LO1"]),
      criteria: freezeList([
        {
          id: "P1",
          title: "Universal programming constructs",
          summary: "Show understanding of the programming constructs used to build software for business."
        }
      ]),
      teachingWeeks: Object.freeze([1, 2, 3, 4, 5, 6]),
      releaseDate: null,
      dueDate: null,
      status: "available",
      route: "assignments/assignment-1/",
      evidenceNote: "Formative weekly practice prepares the technical guide. It is not automatically treated as assessed evidence.",
      stages: freezeList([
        { id: "variables", title: "Variables and data types", week: 1, status: "in-progress" },
        { id: "conversion", title: "Conversion and predefined subroutines", week: 2, status: "not-started" },
        { id: "selection", title: "Selection", week: 3, status: "not-started" },
        { id: "iteration", title: "Iteration", week: 4, status: "not-started" },
        { id: "encapsulation", title: "Encapsulation, parameters and return values", week: 5, status: "not-started" },
        { id: "gui", title: "GUI objects and technical-guide completion", week: 6, status: "not-started" }
      ])
    },
    {
      id: "A2",
      key: "assignment-2",
      title: "Business Requirements Investigation",
      learningOutcomes: Object.freeze(["LO2"]),
      criteria: freezeList([
        { id: "P2", title: "Investigate business requirements", summary: "Investigate the business need for a programming solution." },
        { id: "M1", title: "Analyse business requirements", summary: "Analyse the investigated requirements." },
        { id: "D1", title: "Evaluate business requirements", summary: "Evaluate the business requirements for the proposed solution." }
      ]),
      teachingWeeks: Object.freeze([7, 8, 9]),
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "assignments/assignment-2/",
      evidenceNote: "The project repository established here continues through Assignments 3 and 4. The hub does not award Pass, Merit or Distinction.",
      stages: freezeList([
        { id: "lifecycle", title: "Incremental system life cycle", week: 7, status: "not-started" },
        { id: "requirements", title: "Investigate business requirements", week: 8, status: "not-started" },
        { id: "feasibility", title: "Feasibility, phased development and Assignment 2", week: 9, status: "not-started" }
      ])
    },
    {
      id: "A3",
      key: "assignment-3",
      title: "Design, Build and Test the Software Solution",
      learningOutcomes: Object.freeze(["LO3"]),
      criteria: freezeList([
        { id: "P3", title: "Design", summary: "Produce a design for the programming solution." },
        { id: "P4", title: "Build", summary: "Develop a prototype of the programming solution." },
        { id: "P5", title: "Test", summary: "Test the prototype of the programming solution." },
        { id: "M2", title: "Adapt design following stakeholder feedback", summary: "Adapt the design after stakeholder negotiation." },
        { id: "D2", title: "Evaluate solution", summary: "Evaluate the programming solution against the original requirements." }
      ]),
      teachingWeeks: Object.freeze([10, 11, 12, 13, 14, 15]),
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "assignments/assignment-3/",
      evidenceNote: "Workspace stages are learner guidance only. They do not award Pass, Merit or Distinction.",
      stages: freezeList([
        { id: "initial-design", title: "Initial design", week: 10, status: "not-started" },
        { id: "house-style", title: "Processing, methodology and house style", week: 11, status: "not-started" },
        { id: "stakeholder-review", title: "Stakeholder review and revised design", week: 12, status: "not-started" },
        { id: "prototype-build", title: "Prototype build", week: 13, status: "not-started" },
        { id: "testing", title: "Testing", week: 14, status: "not-started" },
        { id: "evaluation", title: "Evaluation", week: 15, status: "not-started" }
      ])
    },
    {
      id: "A4",
      key: "assignment-4",
      title: "Demonstrate and Refine the Prototype",
      learningOutcomes: Object.freeze(["LO4"]),
      criteria: freezeList([
        { id: "P6", title: "Demonstrate the prototype", summary: "Demonstrate the prototype to stakeholders." },
        { id: "M3", title: "Refine the prototype", summary: "Refine the prototype following stakeholder feedback." }
      ]),
      teachingWeeks: Object.freeze([16, 17, 18, 19]),
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "assignments/assignment-4/",
      evidenceNote: "Demonstration and refinement remain tutor-assessed. The hub does not judge grading criteria.",
      stages: freezeList([
        { id: "presenting", title: "Presenting to an audience", week: 16, status: "not-started" },
        { id: "demonstrate", title: "Demonstrate to stakeholders", week: 17, status: "not-started" },
        { id: "refine", title: "Adapt from stakeholder feedback", week: 18, status: "not-started" },
        { id: "portfolio", title: "Portfolio consolidation and unit review", week: 19, status: "not-started" }
      ])
    }
  ]);

  var evidenceMap = freezeList([
    {
      learningOutcome: "LO1",
      assignment: "A1",
      criteria: Object.freeze(["P1"]),
      artefact: "Programming constructs technical guide",
      weeks: Object.freeze([1, 2, 3, 4, 5, 6])
    },
    {
      learningOutcome: "LO2",
      assignment: "A2",
      criteria: Object.freeze(["P2", "M1", "D1"]),
      artefact: "Business requirements investigation",
      weeks: Object.freeze([7, 8, 9])
    },
    {
      learningOutcome: "LO3",
      assignment: "A3",
      criteria: Object.freeze(["P3", "P4", "P5", "M2", "D2"]),
      artefact: "Design, prototype, test evidence and evaluation",
      weeks: Object.freeze([10, 11, 12, 13, 14, 15])
    },
    {
      learningOutcome: "LO4",
      assignment: "A4",
      criteria: Object.freeze(["P6", "M3"]),
      artefact: "Demonstration and refined prototype evidence",
      weeks: Object.freeze([16, 17, 18, 19])
    }
  ]);

  function getAssignment(id) {
    return assignments.find(function (item) {
      return item.id === id || item.key === id;
    }) || null;
  }

  var api = Object.freeze({
    assignments: assignments,
    evidenceMap: evidenceMap,
    getAssignment: getAssignment
  });

  root.Unit14Assignments = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
