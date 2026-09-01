#!/usr/bin/env python3
"""Generate Vite HTML entry shells for Unit 14 routes."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRAND_SHORT = "SEF"


def page(
    *,
    title: str,
    description: str,
    page_id: str,
    section: str,
    root: str,
    extra_attrs: str = "",
) -> str:
    depth = root.count("..")
    script = "./src/main.tsx" if depth == 0 else "../" * depth + "src/main.tsx"
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{description}">
  <title>{title}</title>
</head>
<body data-page="{page_id}" data-section="{section}" data-root="{root}"{extra_attrs}>
  <noscript><p>Enable JavaScript to use the Unit 14 Software Engineering for Business Hub.</p></noscript>
  <div id="root"></div>
  <script type="module" src="{script}"></script>
</body>
</html>
"""


WEEKS = [
    (1, "Programming for Business, Variables and Data Types", "available"),
    (2, "Data Type Conversion and Predefined Subroutines", "planned"),
    (3, "Selection", "planned"),
    (4, "Iteration", "planned"),
    (5, "Encapsulation, Parameters and Return Values", "planned"),
    (6, "GUI Objects and Assignment 1 Completion", "planned"),
    (7, "The Modern Incremental System Life Cycle", "planned"),
    (8, "Investigating Business Requirements", "planned"),
    (9, "Feasibility, Phased Development and Assignment 2", "planned"),
    (10, "Design Specification, User Interface and Flow Design", "planned"),
    (11, "Processing, Methodology and Professional House Style", "planned"),
    (12, "Adaptations to Design Following Stakeholder Negotiation", "planned"),
    (13, "Building the Prototype and Using Debug Tools", "planned"),
    (14, "Testing the Prototype and Rectifying Issues", "planned"),
    (15, "Design Evaluation and Assignment 3 Completion", "planned"),
    (16, "Presenting to an Audience", "planned"),
    (17, "Demonstrating the Prototype to Stakeholders", "planned"),
    (18, "Adapting the Prototype from Stakeholder Feedback", "planned"),
    (19, "Assignment 4 Completion, Portfolio Consolidation and Unit Review", "planned"),
]

ASSIGNMENTS = [
    ("A1", "assignment-1", "Programming Constructs Technical Guide", "available", "LO1", "P1"),
    ("A2", "assignment-2", "Business Requirements Investigation", "planned", "LO2", "P2, M1, D1"),
    ("A3", "assignment-3", "Design, Build and Test the Software Solution", "planned", "LO3", "P3, P4, P5, M2, D2"),
    ("A4", "assignment-4", "Demonstrate and Refine the Prototype", "planned", "LO4", "P6, M3"),
]


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> None:
    write(ROOT / "index.html", page(
        title="Unit 14 Software Engineering for Business Hub",
        description="Learner hub for OCR Level 3 IT Unit 14 Software Engineering for Business.",
        page_id="home",
        section="home",
        root=".",
    ))
    write(ROOT / "weeks/index.html", page(
        title="Weeks | Unit 14 Software Engineering for Business Hub",
        description="19-week Scheme of Learning index for OCR Unit 14.",
        page_id="learning",
        section="learning",
        root="..",
    ))
    for number, title, status in WEEKS:
        write(ROOT / f"weeks/week-{number}/index.html", page(
            title=f"Week {number}: {title} | {BRAND_SHORT}",
            description=f"Week {number} learning for OCR Unit 14: {title}.",
            page_id=f"week-{number}",
            section="learning",
            root="../..",
            extra_attrs=f' data-week="{number}" data-lp-view="week" data-lp-week="week-{number}" data-lp-status="{status}"',
        ))
    write(ROOT / "assignments/index.html", page(
        title="Assignments | Unit 14 Software Engineering for Business Hub",
        description="Four internally assessed assignments for OCR Unit 14.",
        page_id="assignments",
        section="assignments",
        root="..",
    ))
    for code, key, title, status, lo, criteria in ASSIGNMENTS:
        write(ROOT / f"assignments/{key}/index.html", page(
            title=f"{code}: {title} | {BRAND_SHORT}",
            description=f"{code} workspace for OCR Unit 14: {title}.",
            page_id=key,
            section="assignments",
            root="../..",
            extra_attrs=f' data-assignment="{code}"',
        ))
    write(ROOT / "project/index.html", page(
        title="Project journey | Unit 14 Software Engineering for Business Hub",
        description="Continuous project lifecycle for Unit 14 Assignments 2 to 4.",
        page_id="project",
        section="project",
        root="..",
    ))
    write(ROOT / "resources/index.html", page(
        title="Resources | Unit 14 Software Engineering for Business Hub",
        description="Shared resources for OCR Unit 14.",
        page_id="resources",
        section="resources",
        root="..",
    ))
    write(ROOT / "help/index.html", page(
        title="Help | Unit 14 Software Engineering for Business Hub",
        description="Help using the Unit 14 Software Engineering for Business Hub.",
        page_id="help",
        section="help",
        root="..",
    ))
    write(ROOT / "account/index.html", page(
        title="Account | Unit 14 Software Engineering for Business Hub",
        description="Sign in or create a learner account for Unit 14.",
        page_id="account",
        section="account",
        root="..",
    ))
    print("Wrote Unit 14 Vite HTML routes.")


if __name__ == "__main__":
    main()
