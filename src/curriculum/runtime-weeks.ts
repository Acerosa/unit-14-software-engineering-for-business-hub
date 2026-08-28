import {
  overlayLiveWeekMetadata,
  weeksFromPublication,
  type RuntimeWeekRecord
} from "@learning-platform/core/curriculum-runtime";
import type { ContentPackage } from "./from-package";

export type { RuntimeWeekRecord };

let bundledPackage: ContentPackage | null = null;

export function configureBundledPackage(pkg: ContentPackage) {
  bundledPackage = pkg;
}

function requireBundled(): ContentPackage {
  if (!bundledPackage) {
    throw new Error("Unit 14 bundled curriculum is not configured");
  }
  return bundledPackage;
}

export function runtimeContentPackage(live?: ContentPackage | null): ContentPackage {
  const bundled = requireBundled();
  if (!live) return bundled;
  const teaching: ContentPackage = {
    ...bundled,
    ...(live.version ? { version: live.version } : {}),
    ...(live.hub ? { hub: live.hub } : {}),
    ...(live.curriculum ? { curriculum: live.curriculum } : {}),
    activities: live.activities?.length ? live.activities : bundled.activities,
    sessions: live.sessions?.length ? live.sessions : bundled.sessions,
    learningOutcomes: live.learningOutcomes?.length ? live.learningOutcomes : bundled.learningOutcomes
  };
  return overlayLiveWeekMetadata(teaching, live) as ContentPackage;
}

export function unit14RuntimeWeeks(live?: ContentPackage | null): RuntimeWeekRecord[] {
  if (!bundledPackage) return [];
  return weeksFromPublication(bundledPackage, live);
}

export function runtimeWeekForTeachingWeek(
  live: ContentPackage | null | undefined,
  teachingWeek: number
): RuntimeWeekRecord | null {
  if (!bundledPackage) return null;
  return unit14RuntimeWeeks(live).find((week) => week.teachingWeek === teachingWeek) || null;
}

export function runtimeWeekForId(
  live: ContentPackage | null | undefined,
  weekId: string
): RuntimeWeekRecord | null {
  if (!bundledPackage) return null;
  return unit14RuntimeWeeks(live).find((week) => week.id === weekId) || null;
}
