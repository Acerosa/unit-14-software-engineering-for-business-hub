import { useEffect, useState } from "react";
import { APP_CONFIG } from "../config";
import {
  getContentEngine,
  packagePathFromBody,
  type AssignmentsAdapter,
  type CurriculumAdapter
} from "../content/engine";

export function useContentPackage() {
  const [pkg, setPackage] = useState<unknown>(null);
  const [curriculum, setCurriculum] = useState<CurriculumAdapter | null>(null);
  const [assignments, setAssignments] = useState<AssignmentsAdapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publicationHtml, setPublicationHtml] = useState("");

  useEffect(() => {
    const engine = getContentEngine();
    let cancelled = false;
    engine.loadPackage(packagePathFromBody(document.body), engine.browserIo())
      .then((loaded) => {
        if (cancelled) return;
        const validation = engine.validatePackage(loaded);
        if (!validation.valid && typeof console !== "undefined") {
          console.warn(engine.formatIssues(validation.issues));
        }
        setPackage(loaded);
        setCurriculum(engine.adaptCurriculum(loaded));
        setAssignments(engine.adaptAssignments(loaded));
        (window as { __lpPackage?: unknown }).__lpPackage = loaded;
        document.dispatchEvent(new CustomEvent("lp:content-ready", { detail: { package: loaded } }));
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason));
      });

    function onPublication(event: Event) {
      const state = (event as CustomEvent).detail || engine.getPublicationState?.();
      if (state) {
        setPublicationHtml(engine.renderPublicationStatus(state));
        document.body.dataset.publicationState = state.state || "ERROR";
      }
    }
    if (engine.getPublicationState?.()) {
      const state = engine.getPublicationState();
      setPublicationHtml(engine.renderPublicationStatus(state));
    }
    document.addEventListener("lp:publication-resolved", onPublication);
    return () => {
      cancelled = true;
      document.removeEventListener("lp:publication-resolved", onPublication);
    };
  }, []);

  return { pkg, curriculum, assignments, error, publicationHtml, config: APP_CONFIG };
}
