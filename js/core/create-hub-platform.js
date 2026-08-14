(function (root) {
  "use strict";

  function createHubPlatform(createPlatform, options) {
    var app = options.config;
    var supabase = options.supabase;
    var rootPath = options.root || ".";
    return createPlatform({
      hubCode: app.hubId,
      hubName: app.siteName,
      platformVersion: app.coreVersion,
      accountPath: rootPath + "/account/",
      supabase: {
        projectUrl: supabase.projectUrl,
        publishableKey: supabase.publishableKey
      },
      navigation: (app.navigation || []).map(function (item) {
        return Object.assign({}, item, {
          path: item.id === "home" ? rootPath + "/" : rootPath + "/" + item.path
        });
      }),
      navigationMode: "as-supplied",
      features: app.features,
      theme: app.theme
    });
  }

  root.createHubPlatform = createHubPlatform;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createHubPlatform: createHubPlatform };
  }
})(typeof window !== "undefined" ? window : globalThis);
