import type { ContentPackage } from "./from-package";
import { runtimeContentPackage } from "./runtime-weeks";

export type CurriculumRuntime = {
  source?: string;
  package?: ContentPackage | null;
  state?: { state?: string; message?: string; allowsSubmission?: boolean; reason?: string | null } | null;
  publication?: { version?: string; hub?: string; course?: string } | null;
};

export function applyUnit14Curriculum(
  runtime: CurriculumRuntime,
  target: Window & typeof globalThis = window
) {
  const source = runtime.source || "none";
  const livePackage = source === "published" ? (runtime.package || null) : null;
  const pkg = livePackage
    ? runtimeContentPackage(livePackage)
    : (source === "bundled" || source === "cache" ? runtimeContentPackage(null) : null);

  target.__lpLivePackage = livePackage || undefined;
  target.__lpPackage = pkg || runtime.package || undefined;
  target.__lpPublishedCurriculum = source === "published";

  if (target.document?.body) {
    target.document.body.dataset.curriculumSource = source === "published" ? "published" : "fallback";
    target.document.body.dataset.publicationState = runtime.state?.state || "ERROR";
  }

  if (source !== "published") {
    console.warn("UNIT14_CURRICULUM_FALLBACK", {
      source,
      state: runtime.state?.state || "ERROR",
      reason: runtime.state?.reason || null,
      message: runtime.state?.message || null,
      hub: runtime.publication?.hub || null,
      course: runtime.publication?.course || null
    });
  }

  return { ...runtime, package: pkg || runtime.package, livePackage };
}

export function liveContentPackage(): ContentPackage | null {
  if (typeof window !== "undefined" && window.__lpLivePackage) {
    return window.__lpLivePackage as ContentPackage;
  }
  return null;
}

export function activeContentPackage(pkg?: ContentPackage | null): ContentPackage | null {
  if (pkg) return pkg;
  if (typeof window !== "undefined" && window.__lpPackage) {
    return window.__lpPackage as ContentPackage;
  }
  return null;
}
