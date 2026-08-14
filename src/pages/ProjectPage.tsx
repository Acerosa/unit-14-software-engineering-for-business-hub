const STAGES = [
  { id: "investigate", title: "Investigate", assignment: "A2" },
  { id: "requirements", title: "Requirements", assignment: "A2" },
  { id: "feasibility", title: "Feasibility", assignment: "A2" },
  { id: "plan", title: "Plan", assignment: "A2" },
  { id: "design", title: "Design", assignment: "A3" },
  { id: "stakeholder-review", title: "Stakeholder Review", assignment: "A3" },
  { id: "revise", title: "Revise", assignment: "A3" },
  { id: "build", title: "Build", assignment: "A3" },
  { id: "debug", title: "Debug", assignment: "A3" },
  { id: "test", title: "Test", assignment: "A3" },
  { id: "evaluate", title: "Evaluate", assignment: "A3" },
  { id: "demonstrate", title: "Demonstrate", assignment: "A4" },
  { id: "feedback", title: "Feedback", assignment: "A4" },
  { id: "refine", title: "Refine", assignment: "A4" }
] as const;

export function ProjectPage({ root }: { root: string }) {
  return (
    <>
      <section className="panel" aria-labelledby="journey-heading">
        <h2 id="journey-heading">Lifecycle</h2>
        <div data-project-journey="">
          <p>Assignments 2 to 4 form one continuous software-engineering project. GitHub remains the authentic development and evidence environment.</p>
          <ol className="journey-list">
            {STAGES.map((stage, index) => (
              <li key={stage.id}>
                <span>{stage.title}</span>
                <span>{stage.assignment}</span>
                {index < STAGES.length - 1 ? <span className="visually-hidden"> then </span> : null}
              </li>
            ))}
          </ol>
          <p>Use GitHub for issues, branches, pull requests and releases. This page is guidance, not a replacement project board.</p>
        </div>
      </section>
      <section className="panel" aria-labelledby="github-heading">
        <h2 id="github-heading">GitHub is the project environment</h2>
        <p>Use GitHub for the backlog, issues, branches, pull requests, reviews, milestones and releases. This hub explains the journey; it does not rebuild GitHub.</p>
        <p><a className="text-link" href={`${root}/assignments/`}>View assignments</a></p>
      </section>
    </>
  );
}
