export type PageId =
  | "home"
  | "learning"
  | "week"
  | "assignments"
  | "assignment"
  | "project"
  | "resources"
  | "help"
  | "account";

export type PageContext = {
  page: string;
  section: string;
  root: string;
  week?: string;
  weekStatus?: string;
  assignment?: string;
  view?: string;
};

export function readPageContext(body: HTMLElement = document.body): PageContext {
  return {
    page: body.dataset.page || "home",
    section: body.dataset.section || body.dataset.page || "home",
    root: body.dataset.root || ".",
    week: body.dataset.lpWeek || (body.dataset.week ? `week-${body.dataset.week}` : undefined),
    weekStatus: body.dataset.lpStatus,
    assignment: body.dataset.assignment,
    view: body.dataset.lpView
  };
}

export function currentIds(context: PageContext): string[] {
  return context.page === context.section ? [context.page] : [context.page, context.section];
}
