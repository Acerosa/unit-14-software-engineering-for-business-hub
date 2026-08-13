(function (root) {
  "use strict";

  var learningOutcomes = Object.freeze([
    Object.freeze({
      id: "LO1",
      title: "Understand universal programming constructs."
    }),
    Object.freeze({
      id: "LO2",
      title: "Be able to investigate business requirements for programming solutions."
    }),
    Object.freeze({
      id: "LO3",
      title: "Be able to develop software solutions to meet business requirements."
    }),
    Object.freeze({
      id: "LO4",
      title: "Be able to propose software solutions to meet business requirements."
    })
  ]);

  function week(record) {
    return Object.freeze(record);
  }

  var weeks = Object.freeze([
    week({
      teachingWeek: 1,
      weekKey: "week-1",
      title: "Programming for Business, Variables and Data Types",
      learningOutcomes: Object.freeze(["LO1"]),
      assignment: "A1",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "available",
      route: "weeks/week-1/",
      professionalPractice: "GitHub Classroom, repository provisioning, clone, commits and meaningful commit messages.",
      sessions: Object.freeze([
        Object.freeze({
          id: "session-1",
          title: "Session 1",
          summary: "Programming for business, variables, data types, print and input in Python.",
          defaultOpen: true,
          items: Object.freeze([
            Object.freeze({ title: "Baseline assessment", status: "planned", href: null }),
            Object.freeze({ title: "Business software and data discussion", status: "planned", href: null }),
            Object.freeze({ title: "Variables and fundamental data types", status: "planned", href: null }),
            Object.freeze({ title: "Print", status: "planned", href: null }),
            Object.freeze({ title: "Input", status: "planned", href: null }),
            Object.freeze({ title: "Python development environment guidance", status: "planned", href: null })
          ])
        }),
        Object.freeze({
          id: "session-2",
          title: "Session 2",
          summary: "GitHub Classroom, first commits and guided Python practice.",
          defaultOpen: false,
          items: Object.freeze([
            Object.freeze({ title: "GitHub Classroom introduction", status: "planned", href: null }),
            Object.freeze({ title: "First commits", status: "planned", href: null }),
            Object.freeze({ title: "Guided practice", status: "planned", href: null }),
            Object.freeze({ title: "Independent business-order programming activity", status: "planned", href: null })
          ])
        }),
        Object.freeze({
          id: "directed-study",
          title: "Directed independent study",
          summary: "Start gathering notes for the Assignment 1 technical guide.",
          defaultOpen: false,
          items: Object.freeze([
            Object.freeze({
              title: "Assignment 1 technical-guide progress",
              status: "available",
              href: "assignments/assignment-1/"
            }),
            Object.freeze({ title: "Homework / directed study", status: "planned", href: null })
          ])
        })
      ])
    }),
    week({
      teachingWeek: 2,
      weekKey: "week-2",
      title: "Data Type Conversion and Predefined Subroutines",
      learningOutcomes: Object.freeze(["LO1"]),
      assignment: "A1",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-2/",
      professionalPractice: ".gitignore and a named feature branch."
    }),
    week({
      teachingWeek: 3,
      weekKey: "week-3",
      title: "Selection",
      learningOutcomes: Object.freeze(["LO1"]),
      assignment: "A1",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-3/",
      professionalPractice: "GitHub Issues and linking work to commits."
    }),
    week({
      teachingWeek: 4,
      weekKey: "week-4",
      title: "Iteration",
      learningOutcomes: Object.freeze(["LO1"]),
      assignment: "A1",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-4/",
      professionalPractice: "Feature branches and merging."
    }),
    week({
      teachingWeek: 5,
      weekKey: "week-5",
      title: "Encapsulation, Parameters and Return Values",
      learningOutcomes: Object.freeze(["LO1"]),
      assignment: "A1",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-5/",
      professionalPractice: "Pull requests and peer code review."
    }),
    week({
      teachingWeek: 6,
      weekKey: "week-6",
      title: "GUI Objects and Assignment 1 Completion",
      learningOutcomes: Object.freeze(["LO1"]),
      assignment: "A1",
      phase: "assignment-completion",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-6/",
      professionalPractice: "Tagged releases."
    }),
    week({
      teachingWeek: 7,
      weekKey: "week-7",
      title: "The Modern Incremental System Life Cycle",
      learningOutcomes: Object.freeze(["LO2"]),
      assignment: "A2",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-7/",
      professionalPractice: "Backlog, milestones, releases and incremental development."
    }),
    week({
      teachingWeek: 8,
      weekKey: "week-8",
      title: "Investigating Business Requirements",
      learningOutcomes: Object.freeze(["LO2"]),
      assignment: "A2",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-8/",
      professionalPractice: "Requirements represented as traceable GitHub Issues."
    }),
    week({
      teachingWeek: 9,
      weekKey: "week-9",
      title: "Feasibility, Phased Development and Assignment 2",
      learningOutcomes: Object.freeze(["LO2"]),
      assignment: "A2",
      phase: "assignment-completion",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-9/",
      professionalPractice: "Continue incremental development against the project backlog."
    }),
    week({
      teachingWeek: 10,
      weekKey: "week-10",
      title: "Design Specification, User Interface and Flow Design",
      learningOutcomes: Object.freeze(["LO3"]),
      assignment: "A3",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-10/",
      professionalPractice: "Requirement to Issue to branch workflow continues."
    }),
    week({
      teachingWeek: 11,
      weekKey: "week-11",
      title: "Processing, Methodology and Professional House Style",
      learningOutcomes: Object.freeze(["LO3"]),
      assignment: "A3",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-11/",
      professionalPractice: "House style applied through commits and pull requests."
    }),
    week({
      teachingWeek: 12,
      weekKey: "week-12",
      title: "Adaptations to Design Following Stakeholder Negotiation",
      learningOutcomes: Object.freeze(["LO3"]),
      assignment: "A3",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-12/",
      professionalPractice: "Stakeholder feedback recorded as accepted, deferred or declined changes, with issue discussion and milestone reassignment."
    }),
    week({
      teachingWeek: 13,
      weekKey: "week-13",
      title: "Building the Prototype and Using Debug Tools",
      learningOutcomes: Object.freeze(["LO3"]),
      assignment: "A3",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-13/",
      professionalPractice: "Requirement → Issue → branch → commits → pull request → merge."
    }),
    week({
      teachingWeek: 14,
      weekKey: "week-14",
      title: "Testing the Prototype and Rectifying Issues",
      learningOutcomes: Object.freeze(["LO3"]),
      assignment: "A3",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-14/",
      professionalPractice: "Test and evaluation evidence linked from issues and pull requests."
    }),
    week({
      teachingWeek: 15,
      weekKey: "week-15",
      title: "Design Evaluation and Assignment 3 Completion",
      learningOutcomes: Object.freeze(["LO3"]),
      assignment: "A3",
      phase: "assignment-completion",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-15/",
      professionalPractice: "Release evidence for the evaluated prototype."
    }),
    week({
      teachingWeek: 16,
      weekKey: "week-16",
      title: "Presenting to an Audience",
      learningOutcomes: Object.freeze(["LO4"]),
      assignment: "A4",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-16/",
      professionalPractice: "Presentation artefacts stored with the project repository."
    }),
    week({
      teachingWeek: 17,
      weekKey: "week-17",
      title: "Demonstrating the Prototype to Stakeholders",
      learningOutcomes: Object.freeze(["LO4"]),
      assignment: "A4",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-17/",
      professionalPractice: "Demonstration notes captured against project issues."
    }),
    week({
      teachingWeek: 18,
      weekKey: "week-18",
      title: "Adapting the Prototype from Stakeholder Feedback",
      learningOutcomes: Object.freeze(["LO4"]),
      assignment: "A4",
      phase: "teaching",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-18/",
      professionalPractice: "Feedback implemented through issue, branch, pull request and merge."
    }),
    week({
      teachingWeek: 19,
      weekKey: "week-19",
      title: "Assignment 4 Completion, Portfolio Consolidation and Unit Review",
      learningOutcomes: Object.freeze(["LO4"]),
      assignment: "A4",
      phase: "assignment-completion",
      weekCommencing: null,
      releaseDate: null,
      dueDate: null,
      status: "planned",
      route: "weeks/week-19/",
      professionalPractice: "Final tagged release and portfolio consolidation."
    })
  ]);

  function getWeek(teachingWeek) {
    return weeks.find(function (item) {
      return item.teachingWeek === Number(teachingWeek);
    }) || null;
  }

  function getWeeksByAssignment(assignmentId) {
    return weeks.filter(function (item) {
      return item.assignment === assignmentId;
    });
  }

  var api = Object.freeze({
    learningOutcomes: learningOutcomes,
    weeks: weeks,
    getWeek: getWeek,
    getWeeksByAssignment: getWeeksByAssignment
  });

  root.Unit14Curriculum = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
