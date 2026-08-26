(function (root) {
  "use strict";

  var ns = root.LearningPlatformContent = root.LearningPlatformContent || {};

  function blockById(activity, blockId) {
    return (activity.blocks || []).filter(function (block) { return block.id === blockId; })[0] || null;
  }

  function questionId(block) {
    return (block.content && block.content.questionId) || block.id;
  }

  function shouldSkipHtmlBlockBind(blockRoot, type) {
    // React OptionCards / Classification / TextResponse own their UX; do not restore or mark via HTML.
    if (blockRoot.getAttribute("data-lp-block") === "option-cards") return true;
    // HTML classification uses [data-lp-item] selects; React classification does not.
    if (type === "classification" && !blockRoot.querySelector("[data-lp-item], [data-lp-sort-board]")) {
      return true;
    }
    // React text already mounts char-count / minChars; HTML text does not.
    if (
      (type === "short-response" || type === "reflection") &&
      blockRoot.querySelector("[data-lp-char-count], textarea[data-lp-min-chars]")
    ) {
      return true;
    }
    return false;
  }

  function collectResponse(blockRoot, block) {
    var type = ns.normaliseBlockType(block.type);
    var selected;
    if (type === "classification") {
      selected = {};
      Array.prototype.forEach.call(blockRoot.querySelectorAll("[data-lp-item]"), function (select) {
        selected[select.getAttribute("data-lp-item")] = select.value;
      });
      return selected;
    }
    if (type === "single-choice") {
      selected = blockRoot.querySelector("[data-lp-response]:checked");
      return selected ? selected.value : "";
    }
    selected = blockRoot.querySelector("[data-lp-response]");
    return selected ? selected.value : "";
  }

  function restoreResponse(blockRoot, block, value) {
    var type = ns.normaliseBlockType(block.type);
    if (value == null) return;
    if (type === "classification" && value && typeof value === "object") {
      Array.prototype.forEach.call(blockRoot.querySelectorAll("[data-lp-item]"), function (select) {
        if (value[select.getAttribute("data-lp-item")]) {
          select.value = value[select.getAttribute("data-lp-item")];
        }
      });
      return;
    }
    if (type === "single-choice") {
      Array.prototype.forEach.call(blockRoot.querySelectorAll("[data-lp-response]"), function (input) {
        input.checked = input.value === String(value);
      });
      return;
    }
    var field = blockRoot.querySelector("[data-lp-response]");
    if (field) field.value = String(value);
  }

  function setFeedback(blockRoot, block, response, checked) {
    var panel = blockRoot.querySelector("[data-lp-feedback]");
    var result;
    if (!panel) return;
    if (!checked) {
      panel.textContent = "";
      blockRoot.removeAttribute("data-lp-result");
      Array.prototype.forEach.call(blockRoot.querySelectorAll("[data-lp-item-status]"), function (statusEl) {
        var row = statusEl.closest(".lp-classify-item");
        statusEl.textContent = "";
        if (row) row.removeAttribute("data-lp-result");
      });
      return;
    }
    result = ns.markBlock(block, response);
    panel.textContent = result.feedback || (result.complete ? "Saved." : "Add a response first.");
    if (result.correct === true) blockRoot.setAttribute("data-lp-result", "matched");
    else if (result.correct === false) blockRoot.setAttribute("data-lp-result", "review");
    else blockRoot.setAttribute("data-lp-result", result.complete ? "saved" : "empty");
    Array.prototype.forEach.call(blockRoot.querySelectorAll("[data-lp-item-status]"), function (statusEl) {
      var itemId = statusEl.getAttribute("data-lp-item-status");
      var itemResult = (result.itemResults || []).filter(function (item) { return item.id === itemId; })[0];
      var row = statusEl.closest(".lp-classify-item");
      if (!itemResult || itemResult.correct == null) {
        statusEl.textContent = "";
        if (row) row.removeAttribute("data-lp-result");
        return;
      }
      statusEl.textContent = itemResult.correct ? "Matched." : "Review.";
      if (row) row.setAttribute("data-lp-result", itemResult.correct ? "matched" : "review");
    });
  }

  function activityInteractiveBlocks(activity) {
    return (activity.blocks || []).filter(function (block) {
      return ns.isInteractiveBlockType(block.type);
    });
  }

  function updateActivityStatus(article, activity, draft) {
    var status = article.querySelector("[data-lp-activity-status]");
    var interactive = activityInteractiveBlocks(activity);
    var complete = interactive.length > 0 && interactive.every(function (block) {
      var result = ns.markBlock(block, draft.responses[questionId(block)]);
      return result.complete;
    });
    draft.completed = complete;
    if (complete && !draft.completedAt) draft.completedAt = new Date().toISOString();
    if (!complete) draft.completedAt = null;
    if (status) {
      status.textContent = complete
        ? "Practised. This is learning progress, not an assignment grade."
        : (Object.keys(draft.responses).length ? "In progress. Your draft is saved on this device." : "");
    }
  }

  function bindActivity(article, activity, options) {
    var store = ns.createDraftStore(activity, options);
    var draft = store.load();

    function persist() {
      store.save(draft);
      updateActivityStatus(article, activity, draft);
    }

    activityInteractiveBlocks(activity).forEach(function (block) {
      var type = ns.normaliseBlockType(block.type);
      var blockRoot = article.querySelector('[data-lp-block-id="' + block.id + '"]');
      var qid = questionId(block);
      if (!blockRoot) return;
      if (shouldSkipHtmlBlockBind(blockRoot, type)) return;
      restoreResponse(blockRoot, block, draft.responses[qid]);
      if (draft.checked[qid]) setFeedback(blockRoot, block, draft.responses[qid], true);
    });
    updateActivityStatus(article, activity, draft);

    article.addEventListener("lp-block-result", function (event) {
      var detail = event.detail || {};
      var qid = detail.questionId;
      if (!qid) return;
      if (detail.completed === false) {
        if (detail.response == null || detail.response === "") delete draft.responses[qid];
        else draft.responses[qid] = detail.response;
        draft.checked[qid] = false;
        persist();
        return;
      }
      draft.responses[qid] = detail.response;
      if (detail.completed) draft.checked[qid] = true;
      persist();
      if (detail.completed) {
        ns.submitActivityDraft(activity, draft, Object.assign({}, options, {
          publication: ns.getPublicationState()
        }));
      }
    });

    article.addEventListener("change", function (event) {
      var blockRoot = event.target.closest("[data-lp-block-id]");
      var block;
      var qid;
      if (!blockRoot) return;
      if (shouldSkipHtmlBlockBind(blockRoot, ns.normaliseBlockType(
        (blockById(activity, blockRoot.getAttribute("data-lp-block-id")) || {}).type
      ))) return;
      block = blockById(activity, blockRoot.getAttribute("data-lp-block-id"));
      if (!block) return;
      qid = questionId(block);
      draft.responses[qid] = collectResponse(blockRoot, block);
      persist();
    });

    article.addEventListener("input", function (event) {
      var blockRoot = event.target.closest("[data-lp-block-id]");
      var block;
      var qid;
      if (!blockRoot || !event.target.matches("[data-lp-response]")) return;
      block = blockById(activity, blockRoot.getAttribute("data-lp-block-id"));
      if (!block) return;
      if (shouldSkipHtmlBlockBind(blockRoot, ns.normaliseBlockType(block.type))) return;
      qid = questionId(block);
      draft.responses[qid] = collectResponse(blockRoot, block);
      persist();
    });

    article.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.nodeType === 3) target = target.parentElement;
      if (!target || typeof target.closest !== "function") return;

      var checkEl = target.closest("[data-lp-check]");
      var resetBlockEl = target.closest("[data-lp-reset-block]");
      var copyEl = target.closest("[data-lp-copy]");
      var resetActivityEl = target.closest("[data-lp-reset-activity]");
      var checkId = checkEl && checkEl.getAttribute("data-lp-check");
      var resetBlockId = resetBlockEl && resetBlockEl.getAttribute("data-lp-reset-block");
      var copyId = copyEl && copyEl.getAttribute("data-lp-copy");
      var resetActivity = resetActivityEl && resetActivityEl.getAttribute("data-lp-reset-activity");
      var block;
      var blockRoot;
      var qid;
      var field;

      if (checkId) {
        block = blockById(activity, checkId);
        blockRoot = article.querySelector('[data-lp-block-id="' + checkId + '"]');
        if (!block || !blockRoot) return;
        if (shouldSkipHtmlBlockBind(blockRoot, ns.normaliseBlockType(block.type))) return;
        qid = questionId(block);
        draft.responses[qid] = collectResponse(blockRoot, block);
        draft.checked[qid] = true;
        setFeedback(blockRoot, block, draft.responses[qid], true);
        persist();
        ns.submitActivityDraft(activity, draft, Object.assign({}, options, {
          publication: ns.getPublicationState()
        }));
      }

      if (resetBlockId) {
        block = blockById(activity, resetBlockId);
        blockRoot = article.querySelector('[data-lp-block-id="' + resetBlockId + '"]');
        if (!block || !blockRoot) return;
        if (shouldSkipHtmlBlockBind(blockRoot, ns.normaliseBlockType(block.type))) return;
        field = blockRoot.querySelector("[data-lp-response]");
        if (field) {
          field.value = field.defaultValue;
          qid = questionId(block);
          draft.responses[qid] = field.value;
          draft.checked[qid] = false;
          setFeedback(blockRoot, block, field.value, false);
          persist();
        }
      }

      if (copyId) {
        field = article.querySelector('[data-lp-block-id="' + copyId + '"] [data-lp-response]');
        if (field && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(field.value);
        }
      }

      if (resetActivity === activity.id) {
        draft = store.reset();
        activityInteractiveBlocks(activity).forEach(function (item) {
          var rootEl = article.querySelector('[data-lp-block-id="' + item.id + '"]');
          var responseField;
          var type;
          if (!rootEl) return;
          type = ns.normaliseBlockType(item.type);
          if (shouldSkipHtmlBlockBind(rootEl, type)) return;
          if (type === "single-choice") {
            Array.prototype.forEach.call(rootEl.querySelectorAll("[data-lp-response]"), function (input) {
              input.checked = false;
            });
          } else if (type === "classification") {
            Array.prototype.forEach.call(rootEl.querySelectorAll("[data-lp-item]"), function (select) {
              select.selectedIndex = 0;
            });
          } else {
            responseField = rootEl.querySelector("[data-lp-response]");
            if (responseField) responseField.value = responseField.defaultValue;
          }
          setFeedback(rootEl, item, null, false);
        });
        persist();
      }
    });
  }

  ns.bindInteractive = function (rootEl, pkg, options) {
    if (!rootEl) return;
    Array.prototype.forEach.call(rootEl.querySelectorAll("[data-lp-activity]"), function (article) {
      var activityId = article.getAttribute("data-lp-activity");
      var activity = (pkg.activities || []).filter(function (item) { return item.id === activityId; })[0];
      if (!activity) return;
      if (article.getAttribute("data-lp-bound") === activityId) return;
      article.setAttribute("data-lp-bound", activityId);
      bindActivity(article, activity, options || {});
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
