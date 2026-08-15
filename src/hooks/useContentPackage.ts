import { useEffect, useState } from "react";
import { APP_CONFIG } from "../config";
import {
  getContentEngine,
  packagePathFromBody,
  type AssignmentsAdapter,
  type CurriculumAdapter
} from "../content/engine";
import { SUPABASE_CONFIG } from "../supabase-config";

export function useContentPackage() {
  const [pkg, setPackage] = useState<unknown>(null);
  const [curriculum, setCurriculum] = useState<CurriculumAdapter | null>(null);
  const [assignments, setAssignments] = useState<AssignmentsAdapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publicationHtml, setPublicationHtml] = useState("");

  useEffect(() => {
    const engine = getContentEngine();
    let cancelled = false;

    function applyPackage(loaded: unknown, state?: { state?: string }) {
      const validation = engine.validatePackage(loaded);
      if (!validation.valid && typeof console !== "undefined") {
        console.warn(engine.formatIssues(validation.issues));
      }
      setPackage(loaded);
      setCurriculum(engine.adaptCurriculum(loaded));
      setAssignments(engine.adaptAssignments(loaded));
      (window as { __lpPackage?: unknown }).__lpPackage = loaded;
      document.body.dataset.curriculumSource = state?.state === "PUBLISHED" ? "published" : "fallback";
      document.dispatchEvent(new CustomEvent("lp:content-ready", { detail: { package: loaded, publication: state } }));
    }

    function applyPublication(state: { state?: string } | null | undefined) {
      if (!state) return;
      setPublicationHtml(engine.renderPublicationStatus(state));
      document.body.dataset.publicationState = state.state || "ERROR";
    }

    engine.loadCurriculumRuntime({
      appConfig: APP_CONFIG,
      config: SUPABASE_CONFIG,
      loadBundled: () => engine.loadPackage(packagePathFromBody(document.body), engine.browserIo()),
      validate: (candidate: unknown) => engine.validatePackage(candidate),
      storage: window.localStorage
    }).then((runtime) => {
      if (cancelled) return;
      applyPublication(runtime.state);
      applyPackage(runtime.package, runtime.state);
    }).catch((reason: unknown) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason));
    });

    function onPublication(event: Event) {
      const state = (event as CustomEvent).detail || engine.getPublicationState?.();
      if (state && state.state) applyPublication(state);
    }
    document.addEventListener("lp:publication-resolved", onPublication);
    return () => {
      cancelled = true;
      document.removeEventListener("lp:publication-resolved", onPublication);
    };
  }, []);

  return { pkg, curriculum, assignments, error, publicationHtml, config: APP_CONFIG };
}
