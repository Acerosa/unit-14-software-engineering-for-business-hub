import { HubShell, LearnerHeader, AuthoredHtml } from "@learning-platform/ui";
import { ContentPackageProvider, useLoadedContent } from "./content/ContentPackageProvider";
import { APP_CONFIG } from "./config";
import { useHubPlatform } from "./hooks/useHubPlatform";
import { currentIds, type PageContext } from "./page-context";
import { breadcrumbs, pageHeader } from "./page-copy";
import { AssignmentPage } from "./pages/AssignmentPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { HomePage } from "./pages/HomePage";
import { ProjectPage } from "./pages/ProjectPage";
import { AccountPage, HelpPage, ResourcesPage } from "./pages/StaticPages";
import { WeekPage } from "./pages/WeekPage";
import { WeeksPage } from "./pages/WeeksPage";
import { createSitePath, navigationItems } from "./paths";

function PageBody({ context, platform }: { context: PageContext; platform?: unknown }) {
  const { pkg, livePackage, curriculum, assignments } = useLoadedContent();
  if (context.page === "home") return <HomePage root={context.root} livePackage={livePackage} />;
  if (context.page === "learning") {
    return <WeeksPage root={context.root} weeks={curriculum?.weeks} livePackage={livePackage} />;
  }
  if (context.view === "week" && context.week) {
    return (
      <WeekPage
        root={context.root}
        weekId={context.week}
        pkg={pkg}
        weeks={curriculum?.weeks}
        livePackage={livePackage}
        platform={platform}
      />
    );
  }
  if (context.page === "assignments") {
    return <AssignmentsPage root={context.root} assignments={assignments?.assignments} />;
  }
  if (context.assignment) {
    return (
      <AssignmentPage
        root={context.root}
        assignmentId={context.assignment}
        assignments={assignments}
        curriculum={curriculum}
        pkg={pkg}
      />
    );
  }
  if (context.page === "project") return <ProjectPage root={context.root} />;
  if (context.page === "resources") return <ResourcesPage />;
  if (context.page === "help") return <HelpPage root={context.root} />;
  if (context.page === "account") return <AccountPage />;
  return <HomePage root={context.root} livePackage={livePackage} />;
}

export function App({ context }: { context: PageContext }) {
  return (
    <ContentPackageProvider>
      <HubApp context={context} />
    </ContentPackageProvider>
  );
}

function HubApp({ context }: { context: PageContext }) {
  const { learner, theme, accountDialog, platform } = useHubPlatform(context.root);
  const { publicationHtml } = useLoadedContent();
  const header = pageHeader(context);

  return (
    <HubShell
      brandTitle={APP_CONFIG.shortName}
      brandTagline={APP_CONFIG.qualification}
      navigation={navigationItems([...APP_CONFIG.navigation], context.root)}
      currentId={context.section}
      currentIds={currentIds(context)}
      theme={theme}
      actions={(
        <div className="student-account" data-student-account="">
          {learner ? (
            <>
              <span className="student-account__name">{learner.displayName || learner.fullName || "Learner"}</span>
              <button
                className="lp-button lp-button--secondary"
                type="button"
                onClick={(event) => accountDialog?.open(event.currentTarget)}
              >
                Account
              </button>
            </>
          ) : (
            <button
              className="lp-button lp-button--secondary"
              type="button"
              onClick={(event) => accountDialog?.open(event.currentTarget)}
            >
              Sign in
            </button>
          )}
        </div>
      )}
      breadcrumbs={breadcrumbs(context)}
      resolveHref={(path) => createSitePath(context.root, path)}
      pageHeader={header}
      learnerHeader={(
        <LearnerHeader
          learner={learner}
          hubName={platform.config.hubName}
          accountHref={platform.config.accountPath}
          onSignOut={() => platform.auth.signOut()}
        />
      )}
      notice={publicationHtml ? <AuthoredHtml html={publicationHtml} data-publication-status="" /> : <div data-publication-status="" />}
      footer={{
        lines: [
          "Unit 14 Software Engineering for Business Hub",
          "OCR Level 3 IT · H/507/5017 · Internally assessed",
          APP_CONFIG.currentPhase
        ]
      }}
    >
      <PageBody context={context} platform={platform} />
    </HubShell>
  );
}
