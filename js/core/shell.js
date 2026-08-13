(function () {
  "use strict";

  var core = window.LearningPlatformCore;
  var platform = window.LearningPlatform && window.LearningPlatform.platform;
  var config = window.APP_CONFIG;
  var utils = window.AppUtils;
  var accountDialog;

  function isCurrent(item, currentPage, currentSection) {
    return item.id === currentPage || item.id === currentSection;
  }

  function navLink(item, currentPage, currentSection, root) {
    var current = isCurrent(item, currentPage, currentSection);
    var href = utils.createSitePath(root, item.path);
    return (
      '<li>' +
      '<a href="' + href + '"' + (current ? ' aria-current="page"' : "") + ">" +
      utils.escapeHtml(item.label) +
      "</a></li>"
    );
  }

  function renderHeader() {
    var headerMount = document.querySelector("[data-site-header]");
    if (!headerMount || !config) return;

    var currentPage = document.body.dataset.page || "home";
    var currentSection = document.body.dataset.section || currentPage;
    var root = document.body.dataset.root || ".";
    var links = config.navigation.map(function (item) {
      return navLink(item, currentPage, currentSection, root);
    }).join("");

    headerMount.innerHTML =
      '<header class="site-header" role="banner">' +
      '<div class="header-bar">' +
      '<a class="site-brand" href="' + utils.createSitePath(root, "") + '">' +
      '<p class="brand-title">' + utils.escapeHtml(config.shortName) + "</p>" +
      '<p class="brand-tagline">' + utils.escapeHtml(config.qualification) + "</p>" +
      "</a>" +
      '<button type="button" class="nav-toggle" aria-controls="site-navigation" aria-expanded="false" aria-label="Open main menu">Menu</button>' +
      '<nav class="site-nav" id="site-navigation" aria-label="Main">' +
      '<ul class="nav-list">' + links + "</ul>" +
      "</nav>" +
      '<div class="header-actions">' +
      '<div class="theme-control">' +
      '<label for="theme-select">Theme</label>' +
      '<select id="theme-select" data-theme-select>' +
      '<option value="system">System</option>' +
      '<option value="light">Light</option>' +
      '<option value="dark">Dark</option>' +
      "</select></div>" +
      '<div class="student-account" data-student-account></div>' +
      "</div></div></header>";

    initialiseMenu(headerMount);
    if (window.ThemeService) {
      window.ThemeService.attachControls(headerMount);
    }
  }

  function initialiseMenu(headerMount) {
    var button = headerMount.querySelector(".nav-toggle");
    var navigation = headerMount.querySelector(".site-nav");
    if (!button || !navigation) return;

    function closeMenu(returnFocus) {
      button.setAttribute("aria-expanded", "false");
      navigation.classList.remove("site-nav--open");
      if (returnFocus) button.focus();
    }

    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      navigation.classList.toggle("site-nav--open", !open);
    });

    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        closeMenu(true);
      }
    });
  }

  function renderAccount(state) {
    var mounts = document.querySelectorAll("[data-student-account]");
    var signedIn = Boolean(state && state.context);

    mounts.forEach(function (mount) {
      if (!signedIn) {
        mount.innerHTML = '<button class="lp-button lp-button--secondary" type="button" data-open-account>Sign in</button>';
        mount.querySelector("[data-open-account]").addEventListener("click", function (event) {
          accountDialog.open(event.currentTarget);
        });
        return;
      }

      mount.innerHTML =
        '<span class="student-account__name"></span>' +
        '<button class="lp-button lp-button--secondary" type="button" data-open-account>Account</button>';
      mount.querySelector(".student-account__name").textContent =
        state.context.firstName || state.context.displayName || "Learner";
      mount.querySelector("[data-open-account]").addEventListener("click", function (event) {
        accountDialog.open(event.currentTarget);
      });
    });
  }

  function mountLearnerHeader() {
    var mount = document.querySelector("[data-learner-header]");
    if (!mount || !core || !platform) return;
    var header = core.createLearnerHeader({
      learnerContext: platform.learner,
      authService: platform.auth,
      config: platform.config
    });
    mount.append(header.element);
  }

  function renderBreadcrumbs() {
    var mount = document.querySelector("[data-breadcrumbs]");
    if (!mount) return;
    var root = document.body.dataset.root || ".";
    var items = [];
    try {
      items = JSON.parse(mount.getAttribute("data-items") || "[]");
    } catch (error) {
      items = [];
    }
    if (!items.length) {
      mount.hidden = true;
      return;
    }
    var html = items.map(function (item, index) {
      var last = index === items.length - 1;
      if (last || !item.path) {
        return "<li><span aria-current=\"page\">" + utils.escapeHtml(item.label) + "</span></li>";
      }
      return "<li><a href=\"" + utils.createSitePath(root, item.path) + "\">" +
        utils.escapeHtml(item.label) + "</a></li>";
    }).join("");
    mount.innerHTML = '<ol class="breadcrumb-list">' + html + "</ol>";
  }

  function renderFooter() {
    var phase = document.querySelector("[data-current-phase]");
    if (phase) phase.textContent = config.currentPhase;
  }

  utils.onReady(function () {
    renderHeader();
    renderBreadcrumbs();
    renderFooter();
    document.body.dataset.platformState = "loading";

    if (!core || !platform) return;

    accountDialog = core.createAccountDialog({
      authService: platform.auth,
      learnerContext: platform.learner,
      onboardingService: platform.onboarding
    });
    document.body.appendChild(accountDialog.element);
    mountLearnerHeader();

    platform.learner.subscribe(renderAccount);
    platform.state.subscribe(function (snapshot) {
      document.body.dataset.platformState = snapshot.status;
    });
  });
})();
