import { describe, expect, it } from "vitest";
import engine from "../../content/engine/index.js";
import { fromResolvedWeek } from "./week-presentation";

describe("Unit 14 session visibility", () => {
  it("keeps available session content in an available week", () => {
    const pkg = engine.loadPackageFromDirectory("content/unit-14");
    const resolved = engine.resolveWeek(pkg, "week-1");
    expect(resolved).toBeTruthy();
    const view = fromResolvedWeek(resolved!, {
      engine,
      root: "/",
      renderActivity: () => ({ html: "activity" })
    });
    expect(view.sessions?.length).toBe(3);
    expect(view.sessions?.every((session) => (session.activities || []).length > 0)).toBe(true);
  });

  it("does not mount planned session activities", () => {
    const pkg = engine.loadPackageFromDirectory("content/unit-14");
    const resolved = engine.resolveWeek(pkg, "week-1");
    if (!resolved?.sessions?.[1]) throw new Error("missing week-1 session 2");
    resolved.sessions[1].document.metadata.status = "planned";
    const view = fromResolvedWeek(resolved, {
      engine,
      root: "/",
      renderActivity: () => ({ html: "secret-activity" })
    });
    expect(view.sessions?.[0].activities?.length).toBeGreaterThan(0);
    expect(view.sessions?.[1].activities).toEqual([]);
    expect(view.sessions?.[1].summary).toBe("Not released yet");
    expect(JSON.stringify(view.sessions?.[1])).not.toMatch(/secret-activity/);
  });

  it("does not expose available sessions when the week is planned", () => {
    const pkg = engine.loadPackageFromDirectory("content/unit-14");
    const resolved = engine.resolveWeek(pkg, "week-1");
    if (!resolved) throw new Error("missing week-1");
    resolved.document.metadata.status = "planned";
    const view = fromResolvedWeek(resolved, {
      engine,
      root: "/",
      renderActivity: () => ({ html: "secret-activity" })
    });
    expect(view.sessions?.every((session) => (session.activities || []).length === 0)).toBe(true);
    expect(JSON.stringify(view.sessions)).not.toMatch(/secret-activity/);
  });
});
