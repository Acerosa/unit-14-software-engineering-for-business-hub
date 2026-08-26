import "@learning-platform/content";
import "../../content/engine/state.js";
import "../../content/engine/publication.js";
import "../../content/engine/submit.js";
import "../../content/engine/interactive.js";
import { APP_CONFIG } from "../config";

export type ContentEngine = {
  loadPackage: (directory: string, io: unknown) => Promise<unknown>;
  packagePathFromPage: (body: HTMLElement, config: unknown) => string;
  browserIo: () => unknown;
  resolveWeek: (pkg: unknown, weekId: string) => ResolvedWeek | null;
  renderActivity: (activity: unknown, options?: { root?: string }) => string;
  renderBlock: (block: unknown, options?: { root?: string }) => string;
  bindInteractive: (
    root: ParentNode | null,
    pkg: unknown,
    options?: { sourcePage?: string; storage?: Storage; learnerKey?: string; platform?: unknown }
  ) => void;
  validatePackage: (pkg: unknown) => { valid: boolean; issues?: unknown[] };
  formatIssues: (issues: unknown) => string;
  adaptCurriculum: (pkg: unknown) => CurriculumAdapter;
  adaptAssignments: (pkg: unknown) => AssignmentsAdapter;
  summariseDraft: (activity: unknown) => { status: string };
  renderPublicationStatus: (state: unknown) => string;
  getPublicationState?: () => unknown;
  createDraftStore?: (
    activity: { id: string; version?: string },
    options?: { storage?: Storage; learnerKey?: string }
  ) => {
    load: () => { responses: Record<string, unknown>; activityId: string };
    save: (draft: unknown) => unknown;
  };
  loadCurriculumRuntime: (options: {
    appConfig: unknown;
    config: unknown;
    session?: unknown;
    fetch?: typeof fetch;
    loadBundled: () => Promise<unknown> | unknown;
    validate: (pkg: unknown) => { valid: boolean; issues?: unknown[] };
    storage?: Storage;
  }) => Promise<{
    source: "published" | "cache" | "bundled";
    package: unknown;
    state: { state?: string };
    publication: unknown;
  }>;
};

export type ResolvedWeek = {
  document: {
    id: string;
    metadata: {
      teachingWeek: number;
      title: string;
      status: string;
      phase?: string;
      weekCommencing?: string;
      professionalPractice?: string;
    };
  };
  assignment?: {
    id: string;
    metadata: {
      title: string;
      route?: string;
      stages?: Array<{ week: number; title: string }>;
    };
  };
  learningOutcomes?: Array<{ id: string; metadata?: { title?: string } }>;
  sessions?: Array<{
    document: { id: string; metadata: { title: string; kind: string; summary?: string; defaultOpen?: boolean } };
    activities?: Array<{ document: unknown; questions?: unknown[]; assets?: unknown[] }>;
  }>;
};

export type CurriculumAdapter = {
  weeks: Array<{
    teachingWeek: number;
    title: string;
    status: string;
    learningOutcomes: string[];
    assignment: string;
    route: string;
  }>;
};

export type AssignmentsAdapter = {
  assignments: Array<{
    id: string;
    title: string;
    status: string;
    learningOutcomes: string[];
    criteria: Array<{ id: string; title: string; summary: string }>;
    stages: Array<{ week: number; title: string }>;
    evidenceNote: string;
    route: string;
  }>;
  getAssignment: (id: string) => AssignmentsAdapter["assignments"][number] | null;
};

export function getContentEngine(): ContentEngine {
  const engine = (globalThis as { LearningPlatformContent?: ContentEngine }).LearningPlatformContent;
  if (!engine) throw new Error("LEARNING_PLATFORM_CONTENT_UNAVAILABLE");
  return engine;
}

export function packagePathFromBody(body: HTMLElement): string {
  return getContentEngine().packagePathFromPage(body, APP_CONFIG);
}
