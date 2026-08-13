#!/usr/bin/env python3
"""Generate static HTML shells for Unit 14 foundation routes."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def scripts(root: str, extras: list[str]) -> str:
    files = [
        f"{root}/js/config/app-config.js",
        f"{root}/js/config/supabase-config.js",
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.3",
        f"{root}/vendor/learning-platform-core/0.1.0/learning-platform-core.iife.js",
        f"{root}/js/core/utils.js",
        f"{root}/js/core/platform.js",
        f"{root}/js/core/theme.js",
        f"{root}/js/core/shell.js",
        *extras,
    ]
    return "".join(
        f'<script defer src="{src}"></script>'
        for src in files
    )


def page(
    *,
    title: str,
    description: str,
    page_id: str,
    section: str,
    root: str,
    breadcrumbs: str,
    heading: str,
    subtitle: str,
    main: str,
    extras: list[str] | None = None,
    extra_attrs: str = "",
) -> str:
    extras = extras or []
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{description}">
  <title>{title}</title>
  <link rel="stylesheet" href="{root}/vendor/learning-platform-core/0.1.0/theme.css">
  <link rel="stylesheet" href="{root}/css/hub.css">
  <script src="{root}/js/core/theme-bootstrap.js"></script>
  {scripts(root, extras)}
</head>
<body data-page="{page_id}" data-section="{section}" data-root="{root}"{extra_attrs}>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <div data-site-header></div>
  <div data-learner-header></div>
  <nav class="breadcrumbs" aria-label="Breadcrumb" data-breadcrumbs data-items='{breadcrumbs}'></nav>
  <header class="page-header">
    <h1>{heading}</h1>
    <p class="page-subtitle">{subtitle}</p>
  </header>
  <main id="main-content" class="site-main" tabindex="-1">
{main}
  </main>
  <footer class="site-footer">
    <div class="site-footer__layout">
      <p><strong>Unit 14 Software Engineering for Business Hub</strong></p>
      <p>OCR Level 3 IT · H/507/5017 · Internally assessed</p>
      <p data-current-phase></p>
    </div>
  </footer>
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


def home() -> str:
    return page(
        title="Unit 14 Software Engineering for Business Hub",
        description="Learner hub for OCR Level 3 IT Unit 14 Software Engineering for Business.",
        page_id="home",
        section="home",
        root=".",
        breadcrumbs="[]",
        heading="Unit 14 Software Engineering for Business",
        subtitle="OCR Level 3 IT · H/507/5017 · Internally assessed assignment unit.",
        extras=[
            "./js/data/curriculum.js",
            "./js/data/assignments.js",
            "./js/pages/render.js",
        ],
        main="""    <section class="panel" aria-labelledby="welcome-heading">
      <h2 id="welcome-heading">Welcome</h2>
      <p>This hub supports weekly learning, assignment evidence and the software-engineering project for Unit 14. Teaching material is publicly readable. Sign in only when you need your learner account, progress or submissions.</p>
      <p>Unit 14 is assignment-based. Learn, practise, create artefacts, gather evidence and improve work. Formative activities are not automatically treated as assessed evidence.</p>
    </section>
    <section aria-labelledby="start-heading">
      <h2 id="start-heading">Where to start</h2>
      <div class="card-grid">
        <article class="hub-card">
          <span class="status-label status-label-available" role="status"><span aria-hidden="true">●</span> Available</span>
          <h3>Week 1</h3>
          <p>Programming for Business, Variables and Data Types. Supports LO1 and Assignment 1 / P1.</p>
          <a class="card-link" href="./weeks/week-1/">Open Week 1</a>
        </article>
        <article class="hub-card">
          <span class="status-label status-label-available" role="status"><span aria-hidden="true">●</span> Available</span>
          <h3>Assignment 1</h3>
          <p>Programming Constructs Technical Guide. Learning in Weeks 1 to 6 builds toward this assignment.</p>
          <a class="card-link" href="./assignments/assignment-1/">Open Assignment 1 workspace</a>
        </article>
        <article class="hub-card">
          <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
          <h3>Project journey</h3>
          <p>Assignments 2 to 4 form one continuous project lifecycle from requirements to refinement.</p>
          <a class="card-link" href="./project/">Open project journey</a>
        </article>
      </div>
    </section>
    <section class="panel" aria-labelledby="model-heading">
      <h2 id="model-heading">How this unit works</h2>
      <p>Learn → practise → apply → create artefacts → gather evidence → receive feedback → improve work → progress through assignment milestones.</p>
      <p>Python is the programming language for this unit. GitHub remains the authentic place for repositories, issues, pull requests and releases.</p>
    </section>""",
    )


def weeks_index() -> str:
    return page(
        title="Weeks | Unit 14 Software Engineering for Business Hub",
        description="19-week Scheme of Learning index for OCR Unit 14.",
        page_id="learning",
        section="learning",
        root="..",
        breadcrumbs='[{"label":"Home","path":""},{"label":"Weeks"}]',
        heading="Weeks",
        subtitle="Follow the weekly journey. Activities belong inside each week rather than on a separate dump page.",
        extras=[
            "../js/data/curriculum.js",
            "../js/data/assignments.js",
            "../js/pages/render.js",
            "../js/pages/weeks.js",
        ],
        main="""    <section class="panel">
      <p>The 19 teaching weeks follow the Unit 14 Scheme of Learning. Calendar dates are left empty until they are taken from the curriculum planner. Teaching breaks are expected; week numbers are not consecutive calendar weeks.</p>
    </section>
    <div class="card-grid" data-week-grid></div>""",
    )


def planned_week(number: int, title: str) -> str:
    return page(
        title=f"Week {number}: {title} | Unit 14 Hub",
        description=f"Week {number} outline for OCR Unit 14: {title}.",
        page_id=f"week-{number}",
        section="learning",
        root="../..",
        breadcrumbs=f'[{{"label":"Home","path":""}},{{"label":"Weeks","path":"weeks/"}},{{"label":"Week {number}"}}]',
        heading=f"Week {number}: {title}",
        subtitle="Planned Scheme of Learning week. Full teaching activities are not available in this foundation release.",
        extra_attrs=f' data-week="{number}"',
        extras=[
            "../../js/data/curriculum.js",
            "../../js/data/assignments.js",
            "../../js/pages/render.js",
            "../../js/pages/week.js",
        ],
        main="""    <section class="panel">
      <p>This page exists so the week route and curriculum metadata are in place. Session activities will be added from the Scheme of Learning in a later implementation phase.</p>
    </section>""",
    )


def week_one() -> str:
    return page(
        title="Week 1: Programming for Business, Variables and Data Types | Unit 14 Hub",
        description="Week 1 learning for OCR Unit 14: programming for business, variables and data types.",
        page_id="week-1",
        section="learning",
        root="../..",
        breadcrumbs='[{"label":"Home","path":""},{"label":"Weeks","path":"weeks/"},{"label":"Week 1"}]',
        heading="Week 1: Programming for Business, Variables and Data Types",
        subtitle="LO1 · Assignment 1 / P1 · Python · GitHub Classroom introduction.",
        extra_attrs=' data-week="1"',
        extras=[
            "../../js/data/curriculum.js",
            "../../js/data/assignments.js",
        ],
        main="""    <section class="panel" aria-labelledby="why-heading">
      <h2 id="why-heading">What you are learning and why</h2>
      <dl class="meta-list">
        <div><dt>Learning outcome</dt><dd>LO1 Understand universal programming constructs.</dd></div>
        <div><dt>Assignment</dt><dd>Assignment 1: Programming Constructs Technical Guide (P1)</dd></div>
        <div><dt>Language</dt><dd>Python</dd></div>
        <div><dt>Practical work</dt><dd>Use variables, print and input, then make first Git commits.</dd></div>
        <div><dt>Evidence later</dt><dd>Notes and examples for the Assignment 1 technical guide. This week's practice is formative.</dd></div>
        <div><dt>What to do next</dt><dd>Work through Session 1, then Session 2, then the directed study.</dd></div>
      </dl>
      <p><a class="text-link" href="../../assignments/assignment-1/">Open the Assignment 1 workspace</a></p>
    </section>

    <details class="session-disclosure panel" id="session-1" open>
      <summary class="session-disclosure__summary">
        <span class="session-disclosure__text">
          <h2 id="session-1-heading" class="session-disclosure__heading">Session 1</h2>
          <span class="session-disclosure__meta">6 planned activities</span>
        </span>
      </summary>
      <div class="session-disclosure__content">
        <p class="panel-note">Session 1 introduces programming for business, variables, data types, print and input. Interactive activities will be added here; this foundation page establishes the week structure.</p>
        <div class="card-grid">
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>1. Baseline assessment</h3>
            <p>A low-stakes check of starting knowledge before Week 1 teaching. Not a formal OCR assessment.</p>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>2. Business software and data discussion</h3>
            <p>Discuss why businesses use software and what data those programs store and process.</p>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>3. Variables and fundamental data types</h3>
            <p>Python variables and core data types used in business programs.</p>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>4. Print</h3>
            <p>Display information for a user with Python output.</p>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>5. Input</h3>
            <p>Capture user-entered business data in a simple program.</p>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>6. Python development environment guidance</h3>
            <p>Set up and use the agreed Python environment for this unit.</p>
          </article>
        </div>
      </div>
    </details>

    <details class="session-disclosure panel" id="session-2">
      <summary class="session-disclosure__summary">
        <span class="session-disclosure__text">
          <h2 id="session-2-heading" class="session-disclosure__heading">Session 2</h2>
          <span class="session-disclosure__meta">4 planned activities</span>
        </span>
      </summary>
      <div class="session-disclosure__content">
        <p class="panel-note">Git and GitHub are part of the curriculum. GitHub remains the authentic development environment; this hub will guide the process rather than recreate GitHub.</p>
        <div class="card-grid">
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>7. GitHub Classroom introduction</h3>
            <p>Accept the Classroom assignment, open the provisioned repository and clone it locally.</p>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>8. First commits</h3>
            <p>Make first commits with meaningful commit messages.</p>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>9. Guided practice</h3>
            <p>Follow a guided Python activity using variables, print and input.</p>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>10. Independent business-order programming activity</h3>
            <p>Write a small independent program for a simple business order scenario.</p>
          </article>
        </div>
      </div>
    </details>

    <details class="session-disclosure panel" id="directed-study">
      <summary class="session-disclosure__summary">
        <span class="session-disclosure__text">
          <h2 id="directed-study-heading" class="session-disclosure__heading">Directed independent study</h2>
          <span class="session-disclosure__meta">2 items</span>
        </span>
      </summary>
      <div class="session-disclosure__content">
        <div class="card-grid">
          <article class="hub-card">
            <span class="status-label status-label-available" role="status"><span aria-hidden="true">●</span> Available</span>
            <h3>Assignment 1 technical-guide progress</h3>
            <p>Start collecting examples of variables and data types for the technical guide. This is preparation, not an automatic Pass.</p>
            <a class="card-link" href="../../assignments/assignment-1/">Open Assignment 1 workspace</a>
          </article>
          <article class="hub-card is-coming-soon">
            <span class="status-label status-label-planned" role="status"><span aria-hidden="true">●</span> Planned</span>
            <h3>Homework / directed study</h3>
            <p>Directed study tasks for Week 1 will be added from the Scheme of Learning.</p>
          </article>
        </div>
      </div>
    </details>""",
    )


def assignments_index() -> str:
    return page(
        title="Assignments | Unit 14 Software Engineering for Business Hub",
        description="Four internally assessed assignments for OCR Unit 14.",
        page_id="assignments",
        section="assignments",
        root="..",
        breadcrumbs='[{"label":"Home","path":""},{"label":"Assignments"}]',
        heading="Assignments",
        subtitle="Four assignment phases. The hub helps you organise evidence. It does not award grades.",
        extras=[
            "../js/data/assignments.js",
            "../js/pages/render.js",
            "../js/pages/assignments.js",
        ],
        main="""    <section class="panel">
      <p>Release and hand-in dates are shown only when they exist in the curriculum planner or approved assignment data. They are currently unset.</p>
    </section>
    <div class="card-grid" data-assignment-grid></div>""",
    )


def assignment_page(code: str, key: str, title: str, status: str, lo: str, criteria: str) -> str:
    return page(
        title=f"{code}: {title} | Unit 14 Hub",
        description=f"{code} workspace for OCR Unit 14: {title}.",
        page_id=key,
        section="assignments",
        root="../..",
        breadcrumbs=f'[{{"label":"Home","path":""}},{{"label":"Assignments","path":"assignments/"}},{{"label":"{code}"}}]',
        heading=f"{code}: {title}",
        subtitle=f"{lo} · {criteria} · Internally assessed. This workspace does not award grades.",
        extra_attrs=f' data-assignment="{code}"',
        extras=[
            "../../js/data/curriculum.js",
            "../../js/data/assignments.js",
            "../../js/pages/render.js",
            "../../js/pages/assignment.js",
        ],
        main=f"""    <section class="panel">
      <p>Status: {status}. Learning and practical work in the listed teaching weeks build toward this assignment.</p>
    </section>
    <div data-assignment-workspace></div>""",
    )


def project_page() -> str:
    return page(
        title="Project journey | Unit 14 Software Engineering for Business Hub",
        description="Continuous project lifecycle for Unit 14 Assignments 2 to 4.",
        page_id="project",
        section="project",
        root="..",
        breadcrumbs='[{"label":"Home","path":""},{"label":"Project"}]',
        heading="Project journey",
        subtitle="Assignments 2 to 4 are one software-engineering project, not three disconnected tasks.",
        extras=[
            "../js/data/project-journey.js",
            "../js/pages/project.js",
        ],
        main="""    <section class="panel" aria-labelledby="journey-heading">
      <h2 id="journey-heading">Lifecycle</h2>
      <div data-project-journey></div>
    </section>
    <section class="panel" aria-labelledby="github-heading">
      <h2 id="github-heading">GitHub is the project environment</h2>
      <p>Use GitHub for the backlog, issues, branches, pull requests, reviews, milestones and releases. This hub explains the journey; it does not rebuild GitHub.</p>
      <p><a class="text-link" href="../assignments/">View assignments</a></p>
    </section>""",
    )


def resources_page() -> str:
    return page(
        title="Resources | Unit 14 Software Engineering for Business Hub",
        description="Shared resources for OCR Unit 14.",
        page_id="resources",
        section="resources",
        root="..",
        breadcrumbs='[{"label":"Home","path":""},{"label":"Resources"}]',
        heading="Resources",
        subtitle="Reference material shared across weeks. Weekly activities stay on their week pages.",
        main="""    <section class="panel">
      <h2>Unit reference</h2>
      <ul>
        <li>OCR Level 3 IT Unit 14 – Software Engineering for Business (H/507/5017)</li>
        <li>Programming language: Python</li>
        <li>Assessment: internally assessed assignments, not an examination unit</li>
      </ul>
    </section>
    <section class="panel">
      <h2>Planned resource sets</h2>
      <p>Python environment notes, Git/GitHub guidance, command-verb definitions and assignment support materials will be added when they are approved for learner use. They are not yet available in this foundation.</p>
    </section>""",
    )


def help_page() -> str:
    return page(
        title="Help | Unit 14 Software Engineering for Business Hub",
        description="Help using the Unit 14 Software Engineering for Business Hub.",
        page_id="help",
        section="help",
        root="..",
        breadcrumbs='[{"label":"Home","path":""},{"label":"Help"}]',
        heading="Help",
        subtitle="How to find weekly learning, assignments and your account.",
        main="""    <section class="panel">
      <h2>How to navigate</h2>
      <ul>
        <li>Use <strong>Home</strong> to see the current starting points.</li>
        <li>Open <a href="../weeks/">Weeks</a> for the 19-week journey. Activities live inside each week.</li>
        <li>Open <a href="../assignments/">Assignments</a> for the four assignment workspaces.</li>
        <li>Open <a href="../project/">Project</a> to see how Assignments 2 to 4 connect.</li>
        <li>On a smaller screen, use the <strong>Menu</strong> button.</li>
      </ul>
    </section>
    <section class="panel">
      <h2>Keyboard access</h2>
      <p>Press Tab to move through links and controls. Use the skip link to move directly to the main content. Press Escape to close the mobile menu or the account dialog.</p>
    </section>
    <section class="panel">
      <h2>Account and progress</h2>
      <p>Teaching pages are readable without signing in. Sign in from <a href="../account/">Account</a> when you need learner context, onboarding or later submissions. The hub never treats browser identity as authority.</p>
    </section>""",
    )


def account_page() -> str:
    return page(
        title="Account | Unit 14 Software Engineering for Business Hub",
        description="Sign in or create a learner account for Unit 14.",
        page_id="account",
        section="account",
        root="..",
        breadcrumbs='[{"label":"Home","path":""},{"label":"Account"}]',
        heading="Learner account",
        subtitle="Sign in or create an account to use learner-specific platform features.",
        main="""    <section class="panel">
      <h2>Sign in or register</h2>
      <p>Use the Sign in control in the header. The shared Learning Platform account dialog handles sign in, registration and onboarding. Passwords are sent only to Supabase Auth and are not stored by this hub.</p>
      <p>Curriculum pages remain available without an account. Progress, enrolment and submissions require authentication.</p>
    </section>""",
    )


def main() -> None:
    write(ROOT / "index.html", home())
    write(ROOT / "weeks/index.html", weeks_index())
    write(ROOT / "weeks/week-1/index.html", week_one())
    for number, title, _status in WEEKS[1:]:
        write(ROOT / f"weeks/week-{number}/index.html", planned_week(number, title))
    write(ROOT / "assignments/index.html", assignments_index())
    for code, key, title, status, lo, criteria in ASSIGNMENTS:
        write(ROOT / f"assignments/{key}/index.html", assignment_page(code, key, title, status, lo, criteria))
    write(ROOT / "project/index.html", project_page())
    write(ROOT / "resources/index.html", resources_page())
    write(ROOT / "help/index.html", help_page())
    write(ROOT / "account/index.html", account_page())
    print("Wrote Unit 14 foundation HTML routes.")


if __name__ == "__main__":
    main()
