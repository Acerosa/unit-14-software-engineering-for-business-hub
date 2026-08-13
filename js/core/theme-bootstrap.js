(function () {
  "use strict";

  var preference = "system";
  try {
    var stored = window.localStorage.getItem("learning-platform.theme.v1");
    if (["system", "light", "dark"].indexOf(stored) !== -1) {
      preference = stored;
    }
  } catch (error) {
    preference = "system";
  }

  var resolved = preference;
  if (resolved === "system") {
    resolved = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-preference", preference);
})();
