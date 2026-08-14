(function () {
  "use strict";

  var core = window.LearningPlatformCore;
  var app = window.APP_CONFIG || {};
  var supabase = window.SUPABASE_CONFIG || {};

  if (!core || typeof core.createPlatform !== "function") {
    throw new Error("LEARNING_PLATFORM_CORE_UNAVAILABLE");
  }

  var root = (document.body && document.body.dataset.root) || ".";

  var platform = core.createPlatform({
    hubCode: app.hubId,
    hubName: app.siteName,
    platformVersion: app.coreVersion,
    accountPath: root + "/account/",
    supabase: {
      projectUrl: supabase.projectUrl,
      publishableKey: supabase.publishableKey
    },
    navigation: (app.navigation || []).map(function (item) {
      return Object.assign({}, item, {
        path: item.id === "home" ? "./" : item.path
      });
    }),
    navigationMode: "as-supplied",
    features: app.features,
    theme: app.theme
  });

  var ready = platform.initialise().catch(function (error) {
    return {
      status: "error",
      error: error
    };
  });

  window.LearningPlatform = Object.freeze({
    coreVersion: app.coreVersion,
    platform: platform,
    ready: ready
  });
})();
