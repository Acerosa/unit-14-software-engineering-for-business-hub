(function () {
  "use strict";

  var core = window.LearningPlatformCore;
  var platform = window.LearningPlatform && window.LearningPlatform.platform;
  var config = window.APP_CONFIG;
  var utils = window.AppUtils;
  var accountDialog;
  var navigationController;

  function currentIds() {
    var page = document.body.dataset.page || "home";
    var section = document.body.dataset.section || page;
    return page === section ? [page] : [page, section];
  }

  function renderHeader() {
    var headerMount = document.querySelector("[data-site-header]");
    if (!headerMount || !config || !core || !platform) return;

    var actions = document.createElement("div");
    var account = document.createElement("div");
    account.className = "student-account";
    account.setAttribute("data-student-account", "");
    actions.appendChild(account);

    var banner = document.createElement("header");
    banner.className = "lp-shell__banner";
    banner.setAttribute("role", "banner");

    navigationController = core.createNavigationShell({
      config: platform.config,
      currentId: document.body.dataset.section || document.body.dataset.page || "home",
      currentIds: currentIds(),
      themeService: platform.theme,
      brandTitle: config.shortName,
      brandTagline: config.qualification,
      actions: actions
    });
    banner.appendChild(navigationController.element);
    headerMount.replaceChildren(banner);
    document.body.classList.add("lp-shell");
  }

  function renderAccount(state) {
    var mounts = document.querySelectorAll("[data-student-account]");
    var signedIn = Boolean(state && state.context);

    mounts.forEach(function (mount) {
      if (!signedIn) {
        mount.replaceChildren();
        var signIn = document.createElement("button");
        signIn.className = "lp-button lp-button--secondary";
        signIn.type = "button";
        signIn.setAttribute("data-open-account", "");
        signIn.textContent = "Sign in";
        signIn.addEventListener("click", function (event) {
          accountDialog.open(event.currentTarget);
        });
        mount.appendChild(signIn);
        return;
      }

      mount.replaceChildren();
      var name = document.createElement("span");
      name.className = "student-account__name";
      name.textContent = state.context.firstName || state.context.displayName || "Learner";
      var account = document.createElement("button");
      account.className = "lp-button lp-button--secondary";
      account.type = "button";
      account.setAttribute("data-open-account", "");
      account.textContent = "Account";
      account.addEventListener("click", function (event) {
        accountDialog.open(event.currentTarget);
      });
      mount.append(name, account);
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
    if (!mount || !core) return;
    var root = document.body.dataset.root || ".";
    var items = [];
    try {
      items = JSON.parse(mount.getAttribute("data-items") || "[]");
    } catch (error) {
      items = [];
    }
    var crumbs = core.createBreadcrumbs({
      items: items,
      resolveHref: function (path) {
        return utils.createSitePath(root, path);
      }
    });
    mount.replaceWith(crumbs);
  }

  function renderPublicationStatus(state) {
    var mount = document.querySelector("[data-publication-status]");
    var engine = window.LearningPlatformContent;
    if (!mount) {
      mount = document.createElement("div");
      mount.setAttribute("data-publication-status", "");
      if (document.body.firstElementChild) {
        document.body.insertBefore(mount, document.querySelector(".lp-breadcrumbs") || document.querySelector(".breadcrumbs") || document.querySelector(".page-header") || document.body.firstElementChild.nextSibling);
      } else {
        document.body.appendChild(mount);
      }
    }
    if (!engine || typeof engine.renderPublicationStatus !== "function") return;
    mount.innerHTML = engine.renderPublicationStatus(state);
    document.body.dataset.publicationState = state && state.state ? state.state : "ERROR";
  }

  function bindPublicationStatus() {
    var engine = window.LearningPlatformContent;
    if (engine && typeof engine.getPublicationState === "function" && engine.getPublicationState()) {
      renderPublicationStatus(engine.getPublicationState());
    }
    document.addEventListener("lp:publication-resolved", function (event) {
      renderPublicationStatus(event.detail || (engine && engine.getPublicationState && engine.getPublicationState()));
    });
  }

  function renderFooter() {
    var phase = document.querySelector("[data-current-phase]");
    if (phase) phase.textContent = config.currentPhase;
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && navigationController) {
      navigationController.closeMenu(true);
    }
  });

  utils.onReady(function () {
    renderHeader();
    renderBreadcrumbs();
    renderFooter();
    bindPublicationStatus();
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
