(function (root) {
  "use strict";

  var ns = root.LearningPlatformContent = root.LearningPlatformContent || {};

  function normaliseCode(value) {
    return String(value == null ? "" : value)
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+$/gm, "")
      .replace(/^\s*\n+|\n+\s*$/g, "");
  }

  function patternMatches(source, rule) {
    var pattern = typeof rule === "string" ? rule : rule.pattern;
    var flags = typeof rule === "string" ? "" : (rule.flags || "");
    if (!pattern) return false;
    return new RegExp(pattern, flags).test(source);
  }

  ns.markBlock = function (block, response) {
    var content = (block && block.content) || {};
    var type = ns.normaliseBlockType(block && block.type);
    var formative = content.formative === true || (content.marking && content.marking.mode === "formative-local");

    if (type === "single-choice") {
      return {
        complete: Boolean(response),
        correct: formative && content.correctOptionId
          ? String(response) === String(content.correctOptionId)
          : null,
        feedback: !formative ? "" : (String(response) === String(content.correctOptionId)
          ? (content.feedback && content.feedback.correct) || "That matches the expected option."
          : (content.feedback && content.feedback.incorrect) || "Check the options and try again.")
      };
    }

    if (type === "classification") {
      var items = content.items || [];
      var values = response && typeof response === "object" ? response : {};
      var answered = items.every(function (item) { return values[item.id]; });
      var allCorrect = formative && answered && items.every(function (item) {
        return String(values[item.id]) === String(item.correctCategoryId);
      });
      return {
        complete: answered,
        correct: formative ? (answered ? allCorrect : null) : null,
        itemResults: items.map(function (item) {
          var selected = values[item.id];
          var correct = formative && selected
            ? String(selected) === String(item.correctCategoryId)
            : null;
          return { id: item.id, correct: correct };
        }),
        feedback: !formative || !answered
          ? ""
          : (allCorrect
            ? (content.feedback && content.feedback.correct) || "Those types match the business data."
            : (content.feedback && content.feedback.incorrect) || "Look again at whether each value is whole, fractional, text, or true/false.")
      };
    }

    if (type === "short-response" || type === "reflection") {
      var text = String(response == null ? "" : response).trim();
      return {
        complete: text.length > 0,
        correct: null,
        feedback: text && content.guidance ? content.guidance : ""
      };
    }

    if (type === "code-editor") {
      return {
        complete: String(response || "").trim().length > 0,
        correct: null,
        feedback: ""
      };
    }

    if (type === "python-exercise") {
      var source = normaliseCode(response);
      var checks = content.checks || {};
      var required = checks.required || [];
      var prohibited = checks.prohibited || [];
      var missing = required.filter(function (rule) { return !patternMatches(source, rule); });
      var found = prohibited.filter(function (rule) { return patternMatches(source, rule); });
      var hasChecks = required.length > 0 || prohibited.length > 0;
      var passed = hasChecks && missing.length === 0 && found.length === 0 && source.length > 0;
      return {
        complete: source.length > 0,
        correct: hasChecks ? passed : null,
        feedback: !source
          ? "Enter Python in the editor before checking."
          : (passed
            ? (checks.passFeedback || "The required Python constructs are present. This is formative practice, not a grade.")
            : (checks.failFeedback || "A required construct is missing, or a construct that should not appear is still in the code."))
      };
    }

    return { complete: response != null && response !== "", correct: null, feedback: "" };
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
