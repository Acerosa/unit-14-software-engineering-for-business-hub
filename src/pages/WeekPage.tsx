import {
  InteractiveActivity,
  LoadingState,
  PracticeProgressPanel,
  StatusBadge,
  WeekAccessGuard,
  WeekView,
  AuthoredHtml,
  aggregatePracticeProgress,
  applyPracticeResult,
  emptyPracticeProgress,
  isCatalogueReactType,
  questionIdFor,
  type ActivityBlockDocument,
  type ActivityDocument,
  type ActivityResult,
  type PracticeProgressAggregate
} from "@learning-platform/ui";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { APP_CONFIG } from "../config";
import type { ContentPackage } from "../curriculum/from-package";
import { runtimeWeekForId, unit14RuntimeWeeks } from "../curriculum/runtime-weeks";
import { getContentEngine, type CurriculumAdapter, type ResolvedWeek } from "../content/engine";
import { fromResolvedWeek, type ResolvedActivity } from "../content/week-presentation";
import { CodeBlockView } from "../coding/CodeBlockView";
import { isCodeBlockType } from "../coding/blockConfig";
import { createSitePath } from "../paths";

function normaliseBlockType(value: string | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

function persistableResponse(block: ActivityBlockDocument, result: ActivityResult): unknown {
  const type = normaliseBlockType(block.type);
  const responses = result.responses;
  if (type === "single-choice" || type === "option-cards") {
    if (responses && typeof responses === "object" && !Array.isArray(responses) && "optionId" in responses) {
      const optionId = (responses as { optionId?: string | null }).optionId;
      return optionId == null ? "" : optionId;
    }
    return responses == null ? "" : responses;
  }
  if (type === "short-response" || type === "reflection") {
    if (typeof responses === "string") return responses.trim();
    if (responses == null) return "";
    return String(responses).trim();
  }
  if (type === "code-editor" || type === "python-exercise") {
    return typeof responses === "string" ? responses : String(responses ?? "");
  }
  return responses && typeof responses === "object" ? responses : {};
}

function activityDocument(resolved: ResolvedActivity): ActivityDocument {
  return resolved.document as ActivityDocument;
}

function isScorableReactBlock(block: ActivityBlockDocument): boolean {
  const type = normaliseBlockType(block.type);
  return type === "single-choice" || type === "option-cards" || type === "classification";
}

function isCompletableReactBlock(block: ActivityBlockDocument): boolean {
  return isCatalogueReactType(block.type);
}

function blockScorableTotal(block: ActivityBlockDocument): number {
  const type = normaliseBlockType(block.type);
  if (type === "single-choice" || type === "option-cards") return 1;
  if (type === "classification") return ((block.content && block.content.items) || []).length;
  return 0;
}

function weekRequiredTotal(week: ResolvedWeek | null): number {
  if (!week) return 0;
  let total = 0;
  (week.sessions || []).forEach((session) => {
    (session.activities || []).forEach((resolved) => {
      const activity = activityDocument(resolved as ResolvedActivity);
      (activity.blocks || []).forEach((block) => {
        if (isCompletableReactBlock(block)) total += 1;
      });
    });
  });
  return total;
}

function weekScorableTotal(week: ResolvedWeek | null): number {
  if (!week) return 0;
  let total = 0;
  (week.sessions || []).forEach((session) => {
    (session.activities || []).forEach((resolved) => {
      const activity = activityDocument(resolved as ResolvedActivity);
      (activity.blocks || []).forEach((block) => {
        total += blockScorableTotal(block);
      });
    });
  });
  return total;
}

function draftResponsesFor(activity: ActivityDocument): Record<string, unknown> {
  const engine = getContentEngine();
  if (!engine.createDraftStore) return {};
  try {
    const draft = engine.createDraftStore(activity).load();
    return draft?.responses && typeof draft.responses === "object" ? draft.responses : {};
  } catch {
    return {};
  }
}

function stageStatus(stage: { week: number; title: string }, pkg: unknown): string {
  const engine = getContentEngine();
  const week = engine.resolveWeek(pkg, `week-${Number(stage.week)}`);
  if (!week || !(week.sessions || []).length) return "Upcoming";
  let practised = false;
  (week.sessions || []).forEach((session) => {
    (session.activities || []).forEach((resolved) => {
      const summary = engine.summariseDraft(resolved.document);
      if (summary.status === "practised" || summary.status === "started") practised = true;
    });
  });
  return practised ? "Started / practised" : "Not started";
}

export function WeekPage({
  root,
  weekId,
  pkg,
  weeks,
  livePackage,
  platform
}: {
  root: string;
  weekId: string;
  pkg: unknown;
  weeks?: CurriculumAdapter["weeks"];
  livePackage?: ContentPackage | null;
  platform?: unknown;
}) {
  const engine = getContentEngine();
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(emptyPracticeProgress());
  const [practice, setPractice] = useState<PracticeProgressAggregate>(
    aggregatePracticeProgress(emptyPracticeProgress(), { requiredBlocks: 0, scorableTotal: 0 })
  );
  const resolved = pkg ? engine.resolveWeek(pkg, weekId) : null;
  const scorableTotal = useMemo(() => weekScorableTotal(resolved), [resolved]);
  const requiredTotal = useMemo(() => weekRequiredTotal(resolved), [resolved]);
  const runtimeWeek = useMemo(() => runtimeWeekForId(livePackage, weekId), [livePackage, weekId]);
  const guardWeek = runtimeWeek || {
    id: weekId,
    teachingWeek: Number(weekId.replace(/^week-/, "")) || 0,
    status: "",
    available: false,
    title: resolved?.document.metadata.title || weekId
  };
  const accessibleWeeks = useMemo(() => {
    const availableTeachingWeeks = new Set(
      unit14RuntimeWeeks(livePackage).filter((week) => week.available).map((week) => week.teachingWeek)
    );
    return (weeks || []).filter((week) => availableTeachingWeeks.has(week.teachingWeek));
  }, [livePackage, weeks]);

  useEffect(() => {
    progressRef.current = emptyPracticeProgress();
    setPractice(aggregatePracticeProgress(emptyPracticeProgress(), {
      requiredBlocks: requiredTotal,
      scorableTotal
    }));
  }, [weekId, requiredTotal, scorableTotal]);

  const recordPracticeResult = useCallback((result: ActivityResult, block: ActivityBlockDocument) => {
    if (!result.completed) return;
    if (!isCompletableReactBlock(block) && !isScorableReactBlock(block)) return;
    progressRef.current = applyPracticeResult(progressRef.current, questionIdFor(block), result);
    setPractice(aggregatePracticeProgress(progressRef.current, {
      requiredBlocks: requiredTotal,
      scorableTotal
    }));
  }, [requiredTotal, scorableTotal]);

  const presentation = useMemo(() => {
    if (!resolved) return null;
    return fromResolvedWeek(resolved, {
      engine,
      root,
      weeks: accessibleWeeks,
      features: APP_CONFIG.ui,
      renderActivity: (activityResolved: ResolvedActivity) => {
        const activity = activityDocument(activityResolved);
        return {
          children: (
            <InteractiveActivity
              activity={activity}
              platform={platform}
              initialResponses={draftResponsesFor(activity)}
              renderFallback={(block) => {
                if (isCodeBlockType(block.type)) {
                  const qid = questionIdFor(block);
                  const initial = draftResponsesFor(activity)[qid];
                  return (
                    <CodeBlockView
                      block={block}
                      initialCode={typeof initial === "string" ? initial : undefined}
                      onResult={(result) => {
                        const article = mountRef.current?.querySelector(`[data-lp-activity="${activity.id}"]`);
                        article?.dispatchEvent(new CustomEvent("lp-block-result", {
                          bubbles: true,
                          detail: {
                            questionId: qid,
                            response: persistableResponse(block, result),
                            completed: result.completed
                          }
                        }));
                      }}
                    />
                  );
                }
                return <AuthoredHtml html={engine.renderBlock(block)} />;
              }}
              onResult={(result: ActivityResult, block: ActivityBlockDocument) => {
                const article = mountRef.current?.querySelector(`[data-lp-activity="${activity.id}"]`);
                article?.dispatchEvent(new CustomEvent("lp-block-result", {
                  bubbles: true,
                  detail: {
                    questionId: questionIdFor(block),
                    response: persistableResponse(block, result),
                    completed: result.completed
                  }
                }));
                recordPracticeResult(result, block);
              }}
            />
          )
        };
      }
    });
  }, [accessibleWeeks, engine, platform, recordPracticeResult, resolved, root]);

  // Re-bind after every commit so React fallback HTML retains draft listeners.
  useLayoutEffect(() => {
    if (!pkg || !mountRef.current || !presentation || !guardWeek.available) return;
    engine.bindInteractive(mountRef.current, pkg, {
      sourcePage: window.location.pathname
    });
  });

  if (!pkg) return <LoadingState message="Loading this week's sessions" />;
  if (!resolved || !presentation) {
    return <p>This week is not in the curriculum package.</p>;
  }

  const showAssignmentProgress = Boolean(resolved.assignment && (resolved.sessions || []).length);
  const weekNumber = resolved.document.metadata.teachingWeek;
  const weekBadge = `Week ${weekNumber}: ${resolved.document.metadata.title}`;
  const summaryScore = scorableTotal > 0 ? {
    correct: practice.score.correct,
    total: Math.max(scorableTotal, practice.score.total, 1)
  } : undefined;
  const coverage = practice.completion;
  const practiceComplete = practice.complete;

  return (
    <WeekAccessGuard week={guardWeek}>
      <div data-lp-mount="" ref={mountRef}>
        <WeekView {...presentation} />
        {showAssignmentProgress ? (
          <section className="panel" aria-labelledby="a1-progress-heading">
            <h2 id="a1-progress-heading">{resolved.assignment!.id} learning progress</h2>
            <p>This tracks preparation for the technical guide. Completing a hub activity is not P1 achieved. The hub does not award Pass, Merit or Distinction.</p>
            <ol className="journey-list">
              {(resolved.assignment!.metadata.stages || []).map((stage) => {
                const label = stageStatus(stage, pkg);
                const tone = label.includes("practised") || label.includes("Started") ? "in-progress" : "planned";
                return (
                  <li key={stage.title}>
                    <span>{stage.title}</span>
                    <StatusBadge status={tone} label={label} />
                  </li>
                );
              })}
            </ol>
            {resolved.assignment!.metadata.route ? (
              <p>
                <a className="text-link" href={createSitePath(root, resolved.assignment!.metadata.route)}>
                  Open the Assignment 1 workspace
                </a>
              </p>
            ) : null}
          </section>
        ) : null}
        {requiredTotal > 0 ? (
          <PracticeProgressPanel
            title="Practice progress"
            badge={weekBadge}
            score={summaryScore}
            progress={coverage}
            completed={practiceComplete}
            message="Check items to update progress. Scores update only when the server returns a mark. Formative practice only — not assignment evidence and not P1."
            defaultCollapsed
          />
        ) : null}
      </div>
    </WeekAccessGuard>
  );
}

/** Exported for focused tests — mirrors the WeekPage draft payload mapping. */
export { persistableResponse };
