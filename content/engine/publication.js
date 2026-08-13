(function (root) {
  "use strict";

  var ns = root.LearningPlatformContent = root.LearningPlatformContent || {};
  var SUPPORTED_SCHEMA = "0.1.0";
  var SUPPORTED_PACKAGE = "0.1.0";
  var currentState = null;

  var LEARNER_COPY = {
    MATCHED: "This teaching copy matches the official course version.",
    LOCAL_BEHIND: "An updated version of this course is available. This page still shows the current teaching copy. Progress cannot be saved to your learning record until this hub is updated.",
    LOCAL_AHEAD: "This teaching copy is not the official published version yet. You can still practise here. Progress will not be saved to your learning record until it is published.",
    NO_PUBLICATION: "This course version is not officially published yet. You can still read and practise. Progress will not be saved to your learning record yet.",
    INCOMPATIBLE: "This teaching copy cannot be checked against the official course version. You can still read this page. Progress cannot be saved to your learning record.",
    ERROR: "The official course version could not be confirmed. You can still read this page. Saving progress is temporarily unavailable."
  };

  var LEARNER_LABELS = {
    MATCHED: "Current",
    LOCAL_BEHIND: "Update pending",
    LOCAL_AHEAD: "Preview",
    NO_PUBLICATION: "Preview",
    INCOMPATIBLE: "Unavailable to save",
    ERROR: "Temporarily unable to save progress"
  };

  function compareSemver(left, right) {
    var a = String(left || "0.0.0").split(".").map(function (part) { return Number(part) || 0; });
    var b = String(right || "0.0.0").split(".").map(function (part) { return Number(part) || 0; });
    var i;
    for (i = 0; i < 3; i += 1) {
      if ((a[i] || 0) > (b[i] || 0)) return 1;
      if ((a[i] || 0) < (b[i] || 0)) return -1;
    }
    return 0;
  }

  function localContext(pkg, config) {
    var curriculum = pkg && pkg.curriculum;
    var indexVersion = pkg && pkg.version;
    return {
      hubCode: (config && config.hubId) || (pkg && pkg.hub && pkg.hub.id) || "",
      courseKey: (config && config.courseKey) || (curriculum && curriculum.metadata && curriculum.metadata.course) || "",
      packageVersion: (config && config.curriculumVersion) || indexVersion || (curriculum && curriculum.version) || "",
      schemaVersion: (config && config.schemaVersion) || (pkg && pkg.schemaVersion) || (curriculum && curriculum.schemaVersion) || "",
      contentPackageVersion: (config && config.contentPackageVersion) || SUPPORTED_PACKAGE
    };
  }

  function result(state, local, publication) {
    return {
      state: state,
      label: LEARNER_LABELS[state],
      message: LEARNER_COPY[state],
      allowsSubmission: state === "MATCHED",
      local: local || null,
      publication: publication || null
    };
  }

  function findPublication(rows, hubCode, courseKey) {
    var list = Array.isArray(rows) ? rows : [];
    var i;
    var row;
    for (i = 0; i < list.length; i += 1) {
      row = list[i] || {};
      if (row.hub_code === hubCode && row.course_key === courseKey) return row;
    }
    return null;
  }

  function mapPublication(row) {
    if (!row) return null;
    return {
      hubCode: row.hub_code,
      courseKey: row.course_key,
      packageVersion: row.package_version,
      schemaVersion: row.schema_version,
      sourcePackageVersion: row.source_package_version,
      publishedAt: row.published_at,
      status: "published"
    };
  }

  ns.PUBLICATION_STATES = Object.freeze(Object.keys(LEARNER_COPY));
  ns.SUPPORTED_PUBLICATION_CONTRACT = Object.freeze({
    schemaVersion: SUPPORTED_SCHEMA,
    contentPackageVersion: SUPPORTED_PACKAGE
  });

  ns.localPublicationContext = localContext;
  ns.compareCurriculumVersion = compareSemver;

  ns.resolvePublicationState = function (local, rows, lookupError) {
    var publication;
    if (lookupError) return result("ERROR", local, null);
    if (!local || !local.hubCode || !local.courseKey || !local.packageVersion) {
      return result("ERROR", local, null);
    }
    if (local.schemaVersion && local.schemaVersion !== SUPPORTED_SCHEMA) {
      return result("INCOMPATIBLE", local, null);
    }
    if (local.contentPackageVersion && local.contentPackageVersion !== SUPPORTED_PACKAGE) {
      return result("INCOMPATIBLE", local, null);
    }
    publication = mapPublication(findPublication(rows, local.hubCode, local.courseKey));
    if (!publication) return result("NO_PUBLICATION", local, null);
    if (publication.schemaVersion !== SUPPORTED_SCHEMA || publication.sourcePackageVersion !== SUPPORTED_PACKAGE) {
      return result("INCOMPATIBLE", local, publication);
    }
    if (compareSemver(local.packageVersion, publication.packageVersion) === 0) {
      return result("MATCHED", local, publication);
    }
    if (compareSemver(local.packageVersion, publication.packageVersion) < 0) {
      return result("LOCAL_BEHIND", local, publication);
    }
    return result("LOCAL_AHEAD", local, publication);
  };

  ns.setPublicationState = function (state) {
    currentState = state || null;
    return currentState;
  };

  ns.getPublicationState = function () {
    return currentState;
  };

  ns.publicationAllowsSubmission = function (state) {
    var resolved = state || currentState;
    return Boolean(resolved && resolved.allowsSubmission);
  };

  ns.publicationSubmissionMessage = function (state) {
    var resolved = state || currentState;
    if (!resolved) return LEARNER_COPY.ERROR;
    return resolved.message;
  };

  ns.fetchPublishedCurriculum = function (options) {
    var config = (options && options.config) || {};
    var session = options && options.session;
    var fetchFn = (options && options.fetch) || root.fetch;
    var projectUrl = String(config.projectUrl || "").replace(/\/+$/, "");
    var key = config.publishableKey || "";
    var token = session && session.access_token ? session.access_token : key;

    if (typeof fetchFn !== "function" || !projectUrl || !key) {
      return Promise.reject(new Error("publication-lookup-unavailable"));
    }

    return fetchFn(projectUrl + "/rest/v1/rpc/published_curriculum", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + token,
        "Content-Profile": "api",
        "Accept-Profile": "api",
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: "{}"
    }).then(function (response) {
      if (!response || !response.ok) throw new Error("publication-lookup-failed");
      return response.json();
    }).then(function (payload) {
      return Array.isArray(payload) ? payload : [];
    });
  };

  ns.lookupPublicationState = function (options) {
    var local = (options && options.local) || localContext(options && options.package, options && options.appConfig);
    return ns.fetchPublishedCurriculum(options).then(function (rows) {
      return ns.setPublicationState(ns.resolvePublicationState(local, rows, null));
    }).catch(function () {
      return ns.setPublicationState(ns.resolvePublicationState(local, [], true));
    });
  };

  ns.renderPublicationStatus = function (state) {
    if (!state) return "";
    if (state.state === "MATCHED") {
      return '<p class="visually-hidden" role="status" data-publication-state="MATCHED">' +
        LEARNER_COPY.MATCHED + "</p>";
    }
    return '<section class="publication-banner publication-banner--' + state.state.toLowerCase().replace(/_/g, "-") +
      '" role="status" data-publication-state="' + state.state + '">' +
      "<strong>" + LEARNER_LABELS[state.state] + "</strong>" +
      "<p>" + LEARNER_COPY[state.state] + "</p>" +
      "</section>";
  };

  function bootLookup() {
    var app = root.APP_CONFIG;
    var supabase = root.SUPABASE_CONFIG;
    var platform = root.LearningPlatform && root.LearningPlatform.platform;
    var session;
    if (!app || !supabase || !supabase.projectUrl || typeof ns.lookupPublicationState !== "function") return;
    session = platform && platform.auth && typeof platform.auth.getSession === "function"
      ? platform.auth.getSession()
      : null;
    ns.lookupPublicationState({
      appConfig: app,
      config: supabase,
      session: session
    }).then(function (state) {
      var event;
      if (typeof document === "undefined" || typeof document.dispatchEvent !== "function") return state;
      try {
        event = new CustomEvent("lp:publication-resolved", { detail: state });
        document.dispatchEvent(event);
      } catch (error) {}
      return state;
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootLookup, { once: true });
    } else {
      bootLookup();
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
