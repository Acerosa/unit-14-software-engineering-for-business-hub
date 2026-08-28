import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import pkg from "./test-support/unit14-package.cjs";
import type { ContentPackage } from "./curriculum/from-package";
import { configureBundledPackage } from "./curriculum/runtime-weeks";
import { HomePage } from "./pages/HomePage";
import { WeekPage, persistableResponse } from "./pages/WeekPage";
import { breadcrumbs } from "./page-copy";

const bundled = pkg as ContentPackage;

beforeAll(() => {
  configureBundledPackage(bundled);
});

afterEach(cleanup);

describe("Unit 14 presentation", () => {
  it("keeps Week 1, Week 2 and Assignment 1 as the home starting points when published available", () => {
    render(<HomePage root="." livePackage={bundled} />);
    const week1 = screen.getByRole("link", { name: "Open Week 1" });
    const week2 = screen.getByRole("link", { name: "Open Week 2" });
    const assignment = screen.getByRole("link", { name: "Open Assignment 1 workspace" });
    expect(week1.getAttribute("href")).toBe("./weeks/week-1/");
    expect(week2.getAttribute("href")).toBe("./weeks/week-2/");
    expect(assignment.getAttribute("href")).toBe("./assignments/assignment-1/");
  });

  it("builds nested breadcrumbs for week routes", () => {
    const items = breadcrumbs({
      page: "week-1",
      section: "learning",
      root: "../..",
      week: "week-1",
      view: "week"
    });
    expect(items.map((item) => item.label)).toEqual(["Home", "Weeks", "Week 1"]);
  });

  it("persists React text results as trimmed strings, not empty objects", () => {
    expect(persistableResponse(
      { id: "note", type: "short-response" },
      { completed: true, correct: null, attempts: 1, responses: "  typed answer  " }
    )).toBe("typed answer");
    expect(persistableResponse(
      { id: "journal", type: "reflection" },
      { completed: true, correct: null, attempts: 1, responses: "reflection text" }
    )).toBe("reflection text");
    expect(persistableResponse(
      { id: "choice", type: "single-choice" },
      { completed: true, correct: true, attempts: 1, responses: { optionId: "a" } }
    )).toBe("a");
    expect(persistableResponse(
      { id: "sort", type: "classification" },
      { completed: true, correct: true, attempts: 1, responses: { one: "requirements" } }
    )).toEqual({ one: "requirements" });
  });
});

describe("Unit 14 React catalogue week rendering", () => {
  it("renders Week 1 catalogue types through React and keeps code/python on HTML", () => {
    const { container } = render(
      <WeekPage root="../.." weekId="week-1" pkg={pkg} />
    );

    expect(screen.getAllByText(/not P1 achieved/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /A1 learning progress/i })).toBeTruthy();
    expect(screen.getByText(/does not award Pass, Merit or Distinction/i)).toBeTruthy();

    const panel = screen.getByRole("complementary", { name: "Practice progress" });
    expect(panel.getAttribute("data-lp-docked")).toBe("left");
    expect(panel.getAttribute("data-lp-collapsed")).toBe("true");
    fireEvent.click(within(panel).getByRole("button", { name: "Show progress details" }));
    expect(panel.getAttribute("data-lp-collapsed")).toBe("false");
    expect(within(panel).getByText(/formative practice only/i)).toBeTruthy();
    expect(within(panel).getByText(/not assignment evidence and not P1/i)).toBeTruthy();
    expect(container.querySelector("[data-lp-block='option-cards']")).toBeTruthy();
    expect(container.querySelector("[data-lp-block='classification']")).toBeTruthy();
    expect(container.querySelector("[data-lp-block='short-response']")).toBeTruthy();
    expect(container.querySelector("[data-lp-block='reflection']")).toBeTruthy();

    const textBlock = container.querySelector("[data-lp-block='short-response'], [data-lp-block='reflection']") as HTMLElement;
    expect(textBlock.querySelector("textarea[data-lp-response]")).toBeTruthy();
    expect(textBlock.querySelector("[data-lp-char-count]")).toBeTruthy();
    expect(textBlock.querySelector("[data-lp-char-count]")?.textContent).toMatch(/\d+ \/ \d+ characters minimum/);
    expect(within(textBlock).getByRole("button", { name: "Save response" })).toBeTruthy();

    const field = textBlock.querySelector("textarea[data-lp-response]") as HTMLTextAreaElement;
    fireEvent.paste(field, { clipboardData: { getData: () => "pasted" } });
    expect(textBlock.querySelector("[data-lp-paste-notice]")?.textContent).toMatch(/Paste is disabled/i);

    expect(
      container.querySelector("[data-lp-block='code-editor'], [data-lp-block='python-exercise']")
    ).toBeTruthy();
    expect(container.querySelector("[data-lp-check]")).toBeTruthy();
  });

  it("renders Week 2 catalogue React types alongside HTML code exercises", () => {
    const { container } = render(
      <WeekPage root="../.." weekId="week-2" pkg={pkg} />
    );
    expect(container.querySelector("[data-lp-block='option-cards']")).toBeTruthy();
    expect(container.querySelector("[data-lp-block='classification']")).toBeTruthy();
    expect(container.querySelector("[data-lp-block='short-response']")).toBeTruthy();
    expect(container.querySelector("[data-lp-block='reflection']")).toBeTruthy();
    expect(
      container.querySelector("[data-lp-block='code-editor'], [data-lp-block='python-exercise']")
    ).toBeTruthy();
    expect(screen.getByRole("complementary", { name: "Practice progress" })).toBeTruthy();
    expect(screen.getAllByText(/not P1 achieved/i).length).toBeGreaterThan(0);
  });
});
