(function (root) {
  "use strict";

  var ns = root.LearningPlatformContent = root.LearningPlatformContent || {};

  function type(id, category, implemented, extras) {
    var record = {
      id: id,
      category: category,
      implemented: implemented === true
    };
    var key;
    extras = extras || {};
    for (key in extras) {
      if (Object.prototype.hasOwnProperty.call(extras, key)) {
        record[key] = extras[key];
      }
    }
    return Object.freeze(record);
  }

  var types = [
    type("markdown", "prose", true),
    type("heading", "prose", true),
    type("paragraph", "prose", true),
    type("image", "media", true),
    type("video", "media", true),
    type("callout", "prose", true),
    type("accordion", "prose", true),
    type("reference", "prose", true),
    type("hint", "prose", true),
    type("quote", "prose", true),
    type("divider", "prose", true),
    type("teacher-note", "prose", true, { audience: "teacher" }),
    type("multiple-choice", "question", false, { questionKind: "multiple-choice" }),
    type("multi-select", "question", false, { questionKind: "multi-select" }),
    type("matching", "question", false, { questionKind: "matching" }),
    type("classification", "question", false, { questionKind: "classification" }),
    type("ordering", "question", false, { questionKind: "ordering" }),
    type("fill-gap", "question", false, { questionKind: "fill-gap" }),
    type("short-response", "question", false, { questionKind: "short-response" }),
    type("long-response", "question", false, { questionKind: "long-response" }),
    type("reflection", "question", false, { questionKind: "reflection" }),
    type("code-editor", "code", false),
    type("python-exercise", "code", false, { languages: ["python"] }),
    type("debugging-exercise", "code", false),
    type("code-tracing", "code", false)
  ];

  var byId = {};
  types.forEach(function (item) {
    byId[item.id] = item;
  });

  ns.BLOCK_TYPES = Object.freeze(types);
  ns.BLOCK_TYPE_MAP = Object.freeze(byId);

  ns.normaliseBlockType = function (value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");
  };

  ns.isRegisteredBlockType = function (value) {
    return Object.prototype.hasOwnProperty.call(byId, ns.normaliseBlockType(value));
  };

  ns.getBlockType = function (value) {
    return byId[ns.normaliseBlockType(value)] || null;
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
