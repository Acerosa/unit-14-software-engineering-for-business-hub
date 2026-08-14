import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "./pages/HomePage";
import { breadcrumbs } from "./page-copy";

describe("Unit 14 presentation", () => {
  it("keeps Week 1 and Assignment 1 as the home starting points", () => {
    render(<HomePage root="." />);
    const week1 = screen.getByRole("link", { name: "Open Week 1" });
    const assignment = screen.getByRole("link", { name: "Open Assignment 1 workspace" });
    expect(week1.getAttribute("href")).toBe("./weeks/week-1/");
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
});
