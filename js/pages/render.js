(function () {
  "use strict";

  var utils = window.AppUtils;
  var curriculum = window.Unit14Curriculum;
  var assignments = window.Unit14Assignments;

  function statusClass(status) {
    if (status === "available") return "status-label-available";
    if (status === "in-progress") return "status-label-progress";
    return "status-label-planned";
  }

  function renderWeekCards(mount, weeks, root) {
    if (!mount || !weeks) return;
    mount.innerHTML = weeks.map(function (week) {
      var available = week.status === "available";
      var href = utils.createSitePath(root, week.route);
      var heading = "Week " + week.teachingWeek + ": " + utils.escapeHtml(week.title);
      var body =
        '<article class="hub-card' + (available ? "" : " is-coming-soon") + '">' +
        '<span class="status-label ' + statusClass(week.status) + '" role="status">' +
        '<span aria-hidden="true">●</span> ' + utils.statusLabel(week.status) + "</span>" +
        "<h2>Week " + week.teachingWeek + "</h2>" +
        "<p>" + utils.escapeHtml(week.title) + "</p>" +
        "<p>" + week.learningOutcomes.join(", ") + " · " + week.assignment + "</p>" +
        (available
          ? '<a class="card-link" href="' + href + '">Open ' + heading + "</a>"
          : '<p class="panel-note">This week page is a planned outline until teaching content is added.</p>' +
            '<a class="card-link" href="' + href + '">Open Week ' + week.teachingWeek + " outline</a>") +
        "</article>";
      return body;
    }).join("");
  }

  function renderAssignmentCards(mount, items, root) {
    if (!mount || !items) return;
    mount.innerHTML = items.map(function (item) {
      var href = utils.createSitePath(root, item.route);
      return (
        '<article class="hub-card' + (item.status === "available" ? "" : " is-coming-soon") + '">' +
        '<span class="status-label ' + statusClass(item.status) + '" role="status">' +
        '<span aria-hidden="true">●</span> ' + utils.statusLabel(item.status) + "</span>" +
        "<h2>" + utils.escapeHtml(item.id) + ": " + utils.escapeHtml(item.title) + "</h2>" +
        "<p>" + item.learningOutcomes.join(", ") + " · criteria " +
        item.criteria.map(function (criterion) { return criterion.id; }).join(", ") + "</p>" +
        '<a class="card-link" href="' + href + '">Open ' + utils.escapeHtml(item.id) + "</a>" +
        "</article>"
      );
    }).join("");
  }

  window.Unit14Render = Object.freeze({
    statusClass: statusClass,
    renderWeekCards: renderWeekCards,
    renderAssignmentCards: renderAssignmentCards,
    curriculum: curriculum,
    assignments: assignments
  });
})();
