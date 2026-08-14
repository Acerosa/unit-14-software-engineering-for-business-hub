(function () {
  "use strict";

  var utils = window.AppUtils;
  var core = window.LearningPlatformCore;

  function statusClass(status) {
    if (status === "available") return "status-label-available";
    if (status === "in-progress") return "status-label-progress";
    return "status-label-planned";
  }

  function renderWeekCards(mount, weeks, root) {
    if (!mount || !weeks || !core) return;
    mount.classList.add("lp-card-grid");
    mount.replaceChildren();
    weeks.forEach(function (week) {
      var available = week.status === "available";
      var card = core.createActivityCard({
        title: "Week " + week.teachingWeek,
        description: week.title + " · " + week.learningOutcomes.join(", ") + " · " + week.assignment,
        activityType: available ? "Teaching week" : "Planned week",
        status: utils.statusLabel(week.status),
        badge: true,
        badgeStatus: week.status,
        href: utils.createSitePath(root, week.route),
        actionLabel: available
          ? "Open Week " + week.teachingWeek + ": " + week.title
          : "Open Week " + week.teachingWeek + " outline",
        headingLevel: 2
      });
      if (!available) card.classList.add("lp-card--muted", "is-coming-soon");
      mount.append(card);
    });
  }

  function renderAssignmentCards(mount, items, root) {
    if (!mount || !items || !core) return;
    mount.classList.add("lp-card-grid");
    mount.replaceChildren();
    items.forEach(function (item) {
      var card = core.createActivityCard({
        title: item.id + ": " + item.title,
        description: item.learningOutcomes.join(", ") + " · criteria " +
          item.criteria.map(function (criterion) { return criterion.id; }).join(", "),
        activityType: "Assignment",
        status: utils.statusLabel(item.status),
        badge: true,
        badgeStatus: item.status,
        href: utils.createSitePath(root, item.route),
        actionLabel: "Open " + item.id,
        headingLevel: 2
      });
      if (item.status !== "available") card.classList.add("lp-card--muted", "is-coming-soon");
      mount.append(card);
    });
  }

  window.Unit14Render = Object.freeze({
    statusClass: statusClass,
    renderWeekCards: renderWeekCards,
    renderAssignmentCards: renderAssignmentCards
  });
})();
