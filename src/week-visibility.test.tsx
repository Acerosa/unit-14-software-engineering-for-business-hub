import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import pkg from "./test-support/unit14-package.cjs";
import type { ContentPackage } from "./curriculum/from-package";
import { configureBundledPackage, runtimeContentPackage } from "./curriculum/runtime-weeks";
import { HomePage } from "./pages/HomePage";
import { WeekPage } from "./pages/WeekPage";
import { WeeksPage } from "./pages/WeeksPage";
import { getContentEngine } from "./content/engine";

const bundled = pkg as ContentPackage;

beforeAll(() => {
  configureBundledPackage(bundled);
});

afterEach(() => {
  cleanup();
  delete window.__lpPackage;
  delete window.__lpLivePackage;
  delete window.__lpPublishedCurriculum;
});

function withWeekStatus(source: ContentPackage, updates: Record<string, string>): ContentPackage {
  const clone = structuredClone(source);
  for (const week of clone.weeks || []) {
    if (updates[week.id] && week.metadata) week.metadata.status = updates[week.id];
  }
  return clone;
}

function applyLiveCurriculum(live: ContentPackage) {
  window.__lpLivePackage = live;
  window.__lpPackage = runtimeContentPackage(live);
}

describe("Unit 14 shared week visibility", () => {
  it("A — available week is linked on home and direct route", () => {
    const live = withWeekStatus(bundled, { "week-2": "available" });
    applyLiveCurriculum(live);

    render(<HomePage root="." livePackage={live} />);
    expect(screen.getByRole("link", { name: "Open Week 2" })).toBeTruthy();
    cleanup();

    render(<WeekPage root="../.." weekId="week-2" pkg={runtimeContentPackage(live)} livePackage={live} />);
    expect(screen.queryByRole("heading", { name: "Week not available yet" })).toBeNull();
  });

  it("B — planned week is locked on home and direct route", () => {
    const live = withWeekStatus(bundled, { "week-3": "planned", "week-1": "available", "week-2": "available" });
    applyLiveCurriculum(live);

    render(<HomePage root="." livePackage={live} />);
    expect(screen.queryByRole("link", { name: "Open Week 3" })).toBeNull();
    cleanup();

    render(<WeekPage root="../.." weekId="week-3" pkg={runtimeContentPackage(live)} livePackage={live} />);
    expect(screen.getByRole("heading", { name: "Week not available yet" })).toBeTruthy();
  });

  it("C — publication N+1 unlocks week after runtime reload", () => {
    const planned = withWeekStatus(bundled, { "week-1": "planned" });
    const available = withWeekStatus(bundled, { "week-1": "available" });

    const { rerender } = render(<HomePage root="." livePackage={planned} />);
    expect(screen.queryByRole("link", { name: "Open Week 1" })).toBeNull();
    rerender(<HomePage root="." livePackage={available} />);
    expect(screen.getByRole("link", { name: "Open Week 1" })).toBeTruthy();
  });

  it("D — platform publication status overrides bundled fallback", () => {
    const livePlanned = withWeekStatus(bundled, { "week-2": "planned" });
    expect(runtimeContentPackage(livePlanned).weeks?.find((week) => week.id === "week-2")?.metadata?.status)
      .toBe("planned");

    render(<HomePage root="." livePackage={livePlanned} />);
    expect(screen.queryByRole("link", { name: "Open Week 2" })).toBeNull();
    cleanup();

    const liveAvailable = withWeekStatus(bundled, { "week-2": "available" });
    render(<HomePage root="." livePackage={liveAvailable} />);
    expect(screen.getByRole("link", { name: "Open Week 2" })).toBeTruthy();
  });

  it("E — cold startup before bundled configure does not crash", () => {
    configureBundledPackage(null as unknown as ContentPackage);
    expect(() => render(<HomePage root="." livePackage={null} />)).not.toThrow();
    expect(screen.getByText(/Loading the weekly teaching sequence/i)).toBeTruthy();
    configureBundledPackage(bundled);
  });

  it("F — weeks page respects planned vs available", () => {
    const live = withWeekStatus(bundled, { "week-1": "available", "week-2": "available", "week-3": "planned" });
    const engine = getContentEngine();
    const curriculum = engine.adaptCurriculum(runtimeContentPackage(live));

    render(<WeeksPage root="." weeks={curriculum.weeks} livePackage={live} />);
    expect(screen.getByRole("link", { name: /Open Week 1/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Open Week 2/i })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Open Week 3/i })).toBeNull();
    expect(screen.getByText(/Week 3 not available yet/i)).toBeTruthy();
  });

  it("G — hub isolation: Unit 14 package does not expose another hub", () => {
    expect(bundled.hub?.id).toBe("unit-14-software-engineering-for-business");
    expect(bundled.weeks?.every((week) => week.id.startsWith("week-"))).toBe(true);
    expect(bundled.weeks?.some((week) => /cyber|l2e|unit-3/i.test(String(week.metadata?.title)))).toBe(false);
  });
});
