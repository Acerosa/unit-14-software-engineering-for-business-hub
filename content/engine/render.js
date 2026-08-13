(function (root) {
  "use strict";

  var ns = root.LearningPlatformContent = root.LearningPlatformContent || {};

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusClass(status) {
    if (status === "available") return "status-label status-label-available";
    if (status === "in-progress") return "status-label status-label-progress";
    return "status-label status-label-planned";
  }

  function statusLabel(status) {
    if (status === "available") return "Available";
    if (status === "in-progress") return "In progress";
    return "Planned";
  }

  function createPath(options, href) {
    if (!href) return "";
    if (/^(https?:|mailto:|#)/i.test(href)) return href;
    var root = (options && options.root) || ".";
    return String(root).replace(/\/?$/, "/") + String(href).replace(/^\.\//, "");
  }

  function simpleMarkdown(text) {
    var escaped = escapeHtml(text || "");
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\[([^\]]+)\]\((https?:[^)\s]+|[^)\s]+)\)/g, function (_match, label, href) {
      if (!/^(https:|\/|\.\/|[a-z0-9-]+\/)/i.test(href)) return label;
      return '<a class="text-link" href="' + escapeHtml(href) + '">' + label + "</a>";
    });
    return escaped.split(/\n{2,}/).map(function (paragraph) {
      return "<p>" + paragraph.replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  function renderPlaceholder(block, label) {
    return (
      '<div class="lp-block lp-block--placeholder" data-lp-block="' + escapeHtml(block.type) + '">' +
      '<p class="panel-note">' + escapeHtml(label) + "</p>" +
      "</div>"
    );
  }

  var blockRenderers = {
    heading: function (block) {
      var level = Number((block.content || {}).level) || 3;
      if (level < 2) level = 2;
      if (level > 4) level = 4;
      var tag = "h" + level;
      return "<" + tag + " class=\"lp-block lp-block--heading\">" +
        escapeHtml((block.content || {}).text || "") + "</" + tag + ">";
    },
    paragraph: function (block) {
      return '<p class="lp-block lp-block--paragraph">' + escapeHtml((block.content || {}).text || "") + "</p>";
    },
    markdown: function (block) {
      return '<div class="lp-block lp-block--markdown">' + simpleMarkdown((block.content || {}).text || "") + "</div>";
    },
    image: function (block, options) {
      var content = block.content || {};
      var src = createPath(options, content.src || content.href);
      return '<figure class="lp-block lp-block--image"><img src="' + escapeHtml(src) +
        '" alt="' + escapeHtml(content.alt || "") + '">' +
        (content.caption ? "<figcaption>" + escapeHtml(content.caption) + "</figcaption>" : "") +
        "</figure>";
    },
    video: function (block, options) {
      var content = block.content || {};
      var src = createPath(options, content.src || content.href);
      return '<p class="lp-block lp-block--video"><a class="text-link" href="' + escapeHtml(src) + '">' +
        escapeHtml(content.title || "Open video") + "</a></p>";
    },
    callout: function (block) {
      var content = block.content || {};
      return '<aside class="lp-block lp-callout panel-note" data-tone="' +
        escapeHtml(content.tone || "info") + '">' +
        (content.title ? "<strong>" + escapeHtml(content.title) + "</strong> " : "") +
        escapeHtml(content.text || "") + "</aside>";
    },
    accordion: function (block) {
      var content = block.content || {};
      return '<details class="lp-block lp-block--accordion"><summary>' +
        escapeHtml(content.title || "More") + "</summary><p>" +
        escapeHtml(content.body || "") + "</p></details>";
    },
    reference: function (block, options) {
      var content = block.content || {};
      var href = createPath(options, content.href);
      return '<p class="lp-block lp-block--reference"><a class="text-link" href="' +
        escapeHtml(href) + '">' + escapeHtml(content.label || href) + "</a></p>";
    },
    hint: function (block) {
      return '<p class="lp-block lp-block--hint panel-note">' + escapeHtml((block.content || {}).text || "") + "</p>";
    },
    quote: function (block) {
      var content = block.content || {};
      return "<blockquote class=\"lp-block lp-block--quote\"><p>" + escapeHtml(content.text || "") +
        "</p>" + (content.attribution ? "<cite>" + escapeHtml(content.attribution) + "</cite>" : "") +
        "</blockquote>";
    },
    divider: function () {
      return '<hr class="lp-block lp-block--divider">';
    },
    "teacher-note": function (block, options) {
      if (!(options && options.showTeacherNotes)) return "";
      return '<aside class="lp-block lp-block--teacher-note"><p>' +
        escapeHtml((block.content || {}).text || "") + "</p></aside>";
    }
  };

  ns.renderBlock = function (block, options) {
    var type = ns.getBlockType(block && block.type);
    var renderer;
    options = options || {};
    if (!block) return "";
    if (!type) {
      return renderPlaceholder(block, "Unsupported block type.");
    }
    renderer = blockRenderers[type.id];
    if (renderer) return renderer(block, options);
    return renderPlaceholder(
      block,
      "This " + type.id + " block is registered. Interactive rendering is not enabled yet."
    );
  };

  ns.renderActivity = function (resolved, options) {
    var activity = resolved && resolved.document ? resolved.document : resolved;
    var meta;
    var status;
    var blocks;
    var link = "";
    if (!activity) return "";
    meta = activity.metadata || {};
    status = meta.status || "planned";
    blocks = (activity.blocks || []).map(function (block) {
      return ns.renderBlock(block, options);
    }).join("");
    if (meta.href) {
      link = '<a class="card-link" href="' + escapeHtml(createPath(options, meta.href)) + '">' +
        escapeHtml(meta.title) + "</a>";
    }
    return (
      '<article class="lp-activity hub-card' + (status === "available" ? "" : " is-coming-soon") +
      '" data-lp-activity="' + escapeHtml(activity.id) + '">' +
      '<span class="' + statusClass(status) + '" role="status"><span aria-hidden="true">●</span> ' +
      statusLabel(status) + "</span>" +
      "<h3>" + escapeHtml(meta.title || "") + "</h3>" +
      (meta.summary ? "<p>" + escapeHtml(meta.summary) + "</p>" : "") +
      blocks +
      link +
      "</article>"
    );
  };

  ns.renderSession = function (resolved, options) {
    var session = resolved.document;
    var meta = session.metadata || {};
    var activities = resolved.activities || [];
    var openAttr = meta.defaultOpen ? " open" : "";
    return (
      '<details class="lp-session session-disclosure panel" id="' + escapeHtml(session.id) + '"' + openAttr + ">" +
      '<summary class="session-disclosure__summary"><span class="session-disclosure__text">' +
      '<h2 class="session-disclosure__heading">' + escapeHtml(meta.title) + "</h2>" +
      '<span class="session-disclosure__meta">' + activities.length +
      (activities.length === 1 ? " activity" : " activities") + "</span></span></summary>" +
      '<div class="session-disclosure__content">' +
      (meta.summary ? '<p class="panel-note">' + escapeHtml(meta.summary) + "</p>" : "") +
      '<div class="card-grid">' +
      activities.map(function (activity) {
        return ns.renderActivity(activity, options);
      }).join("") +
      "</div></div></details>"
    );
  };

  ns.renderWeek = function (resolved, options) {
    var week = resolved.document;
    var meta = week.metadata || {};
    var assignment = resolved.assignment;
    var outcomes = resolved.learningOutcomes || [];
    var sessions = resolved.sessions || [];
    var why;
    var planned;
    options = options || {};
    why =
      '<section class="lp-week-meta panel" aria-labelledby="why-heading">' +
      '<h2 id="why-heading">What you are learning and why</h2>' +
      '<dl class="meta-list">' +
      "<div><dt>Learning outcome</dt><dd>" +
      escapeHtml(outcomes.map(function (item) { return item.id + " " + item.metadata.title; }).join("; ") || "Not set") +
      "</dd></div>" +
      "<div><dt>Assignment</dt><dd>" +
      escapeHtml(assignment ? assignment.id + ": " + assignment.metadata.title : (week.relationships.assignment || "None")) +
      "</dd></div>" +
      "<div><dt>Phase</dt><dd>" + escapeHtml(meta.phase || "") + "</dd></div>" +
      "<div><dt>Teaching week commencing</dt><dd>" +
      escapeHtml(meta.weekCommencing || "Not yet populated from the curriculum planner") +
      "</dd></div></dl>" +
      (meta.professionalPractice
        ? "<p><strong>Professional practice this week:</strong> " + escapeHtml(meta.professionalPractice) + "</p>"
        : "") +
      (assignment && assignment.metadata.route
        ? '<p><a class="text-link" href="' + escapeHtml(createPath(options, assignment.metadata.route)) +
          '">Open the ' + escapeHtml(assignment.id) + " workspace</a></p>"
        : "") +
      "</section>";

    if (!sessions.length) {
      planned =
        '<section class="panel" aria-labelledby="planned-heading">' +
        '<h2 id="planned-heading">Planned teaching week</h2>' +
        "<p>Detailed session activities for this week have not been added yet. The outline below is taken from the curriculum registry and must not be treated as finished teaching content.</p>" +
        '<p><a class="text-link" href="' + escapeHtml(createPath(options, "weeks/")) + '">Back to all weeks</a></p>' +
        "</section>";
      return '<div class="lp-week" data-lp-week="' + escapeHtml(week.id) + '">' + why + planned + "</div>";
    }

    return (
      '<div class="lp-week" data-lp-week="' + escapeHtml(week.id) + '">' +
      why +
      sessions.map(function (session) {
        return ns.renderSession(session, options);
      }).join("") +
      "</div>"
    );
  };

  ns.renderCurriculum = function (resolved, options) {
    var curriculum = resolved.document;
    var weeks = resolved.weeks || [];
    return (
      '<section class="lp-curriculum panel"><h2>' + escapeHtml(curriculum.metadata.title) + "</h2>" +
      "<p>" + weeks.length + " teaching weeks.</p></section>" +
      '<div class="card-grid">' +
      weeks.map(function (week) {
        var meta = week.document.metadata;
        var href = createPath(options, meta.route || ("weeks/" + week.document.id + "/"));
        return (
          '<article class="hub-card' + (meta.status === "available" ? "" : " is-coming-soon") + '">' +
          '<span class="' + statusClass(meta.status) + '" role="status"><span aria-hidden="true">●</span> ' +
          statusLabel(meta.status) + "</span>" +
          "<h2>Week " + escapeHtml(meta.teachingWeek) + "</h2>" +
          "<p>" + escapeHtml(meta.title) + "</p>" +
          '<a class="card-link" href="' + escapeHtml(href) + '">Open Week ' +
          escapeHtml(meta.teachingWeek) + "</a></article>"
        );
      }).join("") +
      "</div>"
    );
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
