import { LoadingState, StatusBadge, WeekAccessLink } from "@learning-platform/ui";
import type { ContentPackage } from "../curriculum/from-package";
import { unit14RuntimeWeeks } from "../curriculum/runtime-weeks";
import { createSitePath } from "../paths";

const HOME_WEEK_COPY: Record<number, { description: string }> = {
  1: {
    description: "Programming for Business, Variables and Data Types. Supports LO1 and Assignment 1 / P1."
  },
  2: {
    description: "Data Type Conversion and Predefined Subroutines. Supports LO1 and Assignment 1 / P1."
  }
};

function homeBadgeLabel(week: { available: boolean; status: string }) {
  if (week.available) return "Available";
  return week.status === "archived" ? "Archived" : "Planned";
}

export function HomePage({
  root,
  livePackage
}: {
  root: string;
  livePackage?: ContentPackage | null;
}) {
  const weeks = unit14RuntimeWeeks(livePackage).filter((week) => week.teachingWeek <= 2);
  if (!weeks.length) {
    return <LoadingState message="Loading the weekly teaching sequence." />;
  }

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
          {weeks.map((week) => {
            const copy = HOME_WEEK_COPY[week.teachingWeek];
            return (
              <article className="hub-card" key={week.id}>
                <StatusBadge
                  status={week.available ? "available" : (week.status || "planned")}
                  label={homeBadgeLabel(week)}
                />
                <h3>{`Week ${week.teachingWeek}`}</h3>
                <p>{copy?.description || week.title}</p>
                <WeekAccessLink
                  week={week}
                  href={createSitePath(root, `weeks/${week.id}/`)}
                  className="card-link"
                  lockedClassName="card-link card-link--locked"
                  renderLink={({ href, children, className }) => (
                    <a className={className} href={href}>{children}</a>
                  )}
                >
                  {`Open Week ${week.teachingWeek}`}
                </WeekAccessLink>
              </article>
            );
          })}
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
