import type { BreadcrumbItem } from "@learning-platform/ui";
import type { PageContext } from "./page-context";

const WEEKS: Record<string, { title: string; subtitle: string }> = {
  "week-1": {
    title: "Week 1: Programming for Business, Variables and Data Types",
    subtitle: "LO1 · Assignment 1 / P1 · Python · GitHub Classroom introduction."
  }
};

const ASSIGNMENTS: Record<string, { title: string; subtitle: string }> = {
  "assignment-1": {
    title: "A1: Programming Constructs Technical Guide",
    subtitle: "LO1 · P1 · Internally assessed. This workspace does not award grades."
  },
  "assignment-2": {
    title: "A2: Business Requirements Investigation",
    subtitle: "LO2 · P2, M1, D1 · Internally assessed. This workspace does not award grades."
  },
  "assignment-3": {
    title: "A3: Design, Build and Test the Software Solution",
    subtitle: "LO3 · P3, P4, P5, M2, D2 · Internally assessed. This workspace does not award grades."
  },
  "assignment-4": {
    title: "A4: Demonstrate and Refine the Prototype",
    subtitle: "LO4 · P6, M3 · Internally assessed. This workspace does not award grades."
  }
};

const PLANNED_WEEKS: Array<[number, string]> = [
  [2, "Data Type Conversion and Predefined Subroutines"],
  [3, "Selection"],
  [4, "Iteration"],
  [5, "Encapsulation, Parameters and Return Values"],
  [6, "GUI Objects and Assignment 1 Completion"],
  [7, "The Modern Incremental System Life Cycle"],
  [8, "Investigating Business Requirements"],
  [9, "Feasibility, Phased Development and Assignment 2"],
  [10, "Design Specification, User Interface and Flow Design"],
  [11, "Processing, Methodology and Professional House Style"],
  [12, "Adaptations to Design Following Stakeholder Negotiation"],
  [13, "Building the Prototype and Using Debug Tools"],
  [14, "Testing the Prototype and Rectifying Issues"],
  [15, "Design Evaluation and Assignment 3 Completion"],
  [16, "Presenting to an Audience"],
  [17, "Demonstrating the Prototype to Stakeholders"],
  [18, "Adapting the Prototype from Stakeholder Feedback"],
  [19, "Assignment 4 Completion, Portfolio Consolidation and Unit Review"]
];

PLANNED_WEEKS.forEach(([number, title]) => {
  WEEKS[`week-${number}`] = {
    title: `Week ${number}: ${title}`,
    subtitle: "Planned Scheme of Learning week. Session activities are added from the curriculum when they exist."
  };
});

export function pageHeader(context: PageContext): { title: string; subtitle: string } {
  if (context.week && WEEKS[context.week]) return WEEKS[context.week];
  if (context.assignment && ASSIGNMENTS[context.assignment === "A1" ? "assignment-1" : context.page]) {
    const key = context.page.startsWith("assignment-") ? context.page : `assignment-${context.assignment.replace("A", "")}`;
    if (ASSIGNMENTS[key]) return ASSIGNMENTS[key];
  }
  if (ASSIGNMENTS[context.page]) return ASSIGNMENTS[context.page];
  switch (context.page) {
    case "learning":
      return { title: "Weeks", subtitle: "Follow the weekly journey. Activities belong inside each week rather than on a separate dump page." };
    case "assignments":
      return { title: "Assignments", subtitle: "Four assignment phases. The hub helps you organise evidence. It does not award grades." };
    case "project":
      return { title: "Project journey", subtitle: "Assignments 2 to 4 are one software-engineering project, not three disconnected tasks." };
    case "resources":
      return { title: "Resources", subtitle: "Reference material shared across weeks. Weekly activities stay on their week pages." };
    case "help":
      return { title: "Help", subtitle: "How to find weekly learning, assignments and your account." };
    case "account":
      return { title: "Learner account", subtitle: "Sign in or create an account to use learner-specific platform features." };
    default:
      return {
        title: "Unit 14 Software Engineering for Business",
        subtitle: "OCR Level 3 IT · H/507/5017 · Internally assessed assignment unit."
      };
  }
}

export function breadcrumbs(context: PageContext): BreadcrumbItem[] {
  if (context.page === "home") return [];
  if (context.week) {
    const number = context.week.replace("week-", "");
    return [
      { label: "Home", path: "" },
      { label: "Weeks", path: "weeks/" },
      { label: `Week ${number}` }
    ];
  }
  if (context.page.startsWith("assignment-") || context.assignment) {
    const code = context.assignment || context.page.replace("assignment-", "A");
    return [
      { label: "Home", path: "" },
      { label: "Assignments", path: "assignments/" },
      { label: code.startsWith("A") ? code : `A${code.replace("assignment-", "")}` }
    ];
  }
  const labels: Record<string, string> = {
    learning: "Weeks",
    assignments: "Assignments",
    project: "Project",
    resources: "Resources",
    help: "Help",
    account: "Account"
  };
  return [{ label: "Home", path: "" }, { label: labels[context.page] || context.page }];
}
