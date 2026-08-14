import { StatusBadge } from "@learning-platform/ui";
import { createSitePath } from "../paths";

export function HomePage({ root }: { root: string }) {
  return (
    <>
      <section className="panel" aria-labelledby="welcome-heading">
        <h2 id="welcome-heading">Welcome</h2>
        <p>This hub supports weekly learning, assignment evidence and the software-engineering project for Unit 14. Teaching material is publicly readable. Sign in only when you need your learner account, progress or submissions.</p>
        <p>Unit 14 is assignment-based. Learn, practise, create artefacts, gather evidence and improve work. Formative activities are not automatically treated as assessed evidence.</p>
      </section>
      <section aria-labelledby="start-heading">
        <h2 id="start-heading">Where to start</h2>
        <div className="card-grid">
          <article className="hub-card">
            <StatusBadge status="available" />
            <h3>Week 1</h3>
            <p>Programming for Business, Variables and Data Types. Supports LO1 and Assignment 1 / P1.</p>
            <a className="card-link" href={createSitePath(root, "weeks/week-1/")}>Open Week 1</a>
          </article>
          <article className="hub-card">
            <StatusBadge status="available" />
            <h3>Week 2</h3>
            <p>Data Type Conversion and Predefined Subroutines. Supports LO1 and Assignment 1 / P1.</p>
            <a className="card-link" href={createSitePath(root, "weeks/week-2/")}>Open Week 2</a>
          </article>
          <article className="hub-card">
            <StatusBadge status="available" />
            <h3>Assignment 1</h3>
            <p>Programming Constructs Technical Guide. Learning in Weeks 1 to 6 builds toward this assignment.</p>
            <a className="card-link" href={createSitePath(root, "assignments/assignment-1/")}>Open Assignment 1 workspace</a>
          </article>
          <article className="hub-card">
            <StatusBadge status="planned" />
            <h3>Project journey</h3>
            <p>Assignments 2 to 4 form one continuous project lifecycle from requirements to refinement.</p>
            <a className="card-link" href={createSitePath(root, "project/")}>Open project journey</a>
          </article>
        </div>
      </section>
      <section className="panel" aria-labelledby="model-heading">
        <h2 id="model-heading">How this unit works</h2>
        <p>Learn → practise → apply → create artefacts → gather evidence → receive feedback → improve work → progress through assignment milestones.</p>
        <p>Python is the programming language for this unit. GitHub remains the authentic place for repositories, issues, pull requests and releases.</p>
      </section>
    </>
  );
}
