(function (root) {
  "use strict";

  var ns = root.LearningPlatformContent = root.LearningPlatformContent || {};
  var SUPPORTED_SCHEMA = "0.1.0";
  var SUPPORTED_PACKAGE = "0.1.0";
  var CACHE_PREFIX = "lp.curriculum.cache.v1:";
  var currentState = null;

  var LEARNER_COPY = {
    PUBLISHED: "This teaching copy is the official published course version.",
    FALLBACK: "This page is showing the saved teaching copy because the live course version could not be loaded. You can still read and practise. Progress will not be saved to your learning record until the live version is available.",
    NO_PUBLICATION: "This course version is not officially published yet. You can still read and practise. Progress will not be saved to your learning record yet.",
    INCOMPATIBLE: "This teaching copy cannot be used as the live course version. You can still read the saved copy. Progress cannot be saved to your learning record.",
    ERROR: "The live course version could not be confirmed. You can still read the saved teaching copy. Saving progress is temporarily unavailable."
  };

  var LEARNER_LABELS = {
    PUBLISHED: "Current",
    FALLBACK: "Saved copy",
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
    var indexVersion = (pkg && pkg.indexFile && pkg.indexFile.version) || (pkg && pkg.version);
    return {
      hubCode: (config && config.hubId) || (pkg && pkg.hub && pkg.hub.id) || "",
      courseKey: (config && config.courseKey) || (curriculum && curriculum.metadata && curriculum.metadata.course) || "",
      packageVersion: (pkg && pkg.version) || indexVersion || (curriculum && curriculum.version) || "",
      schemaVersion: (pkg && pkg.schemaVersion) || (config && config.schemaVersion) || (curriculum && curriculum.schemaVersion) || "",
      contentPackageVersion: (config && config.contentPackageVersion) || SUPPORTED_PACKAGE
    };
  }

  function result(state, local, publication) {
    return {
      state: state,
      source: state === "PUBLISHED" ? "published" : "fallback",
      label: LEARNER_LABELS[state],
      message: LEARNER_COPY[state],
      allowsSubmission: state === "PUBLISHED",
      local: local || null,
      publication: publication || null
    };
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
      contentHash: row.content_hash || "",
      status: "published"
    };
  }

  function firstRow(payload) {
    if (Array.isArray(payload)) return payload[0] || null;
    if (payload && typeof payload === "object") return payload;
    return null;
  }

  function cacheKey(hubId, courseKey) {
    return CACHE_PREFIX + String(hubId || "") + ":" + String(courseKey || "");
  }

  ns.PUBLICATION_STATES = Object.freeze(Object.keys(LEARNER_COPY));
  ns.SUPPORTED_PUBLICATION_CONTRACT = Object.freeze({
    schemaVersion: SUPPORTED_SCHEMA,
    contentPackageVersion: SUPPORTED_PACKAGE
  });
  ns.CURRICULUM_CACHE_PREFIX = CACHE_PREFIX;

  ns.localPublicationContext = localContext;
  ns.compareCurriculumVersion = compareSemver;

  ns.hydratePublishedPackage = function (row) {
    var pkg = row && row.package;
    if (!pkg || typeof pkg !== "object") {
      throw new Error("published-package-invalid");
    }
    pkg.version = row.package_version || pkg.version;
    pkg.schemaVersion = row.source_package_version || pkg.schemaVersion;
    pkg.id = pkg.id || (pkg.hub && pkg.hub.id) || "";
    pkg.indexFile = pkg.indexFile || {
      schema: "lp.content.package",
      schemaVersion: pkg.schemaVersion || SUPPORTED_PACKAGE,
      id: pkg.id,
      version: pkg.version
    };
    return pkg;
  };

  ns.curriculumCacheKey = cacheKey;

  ns.writeCurriculumCache = function (storage, hubId, courseKey, row, pkg) {
    if (!storage || typeof storage.setItem !== "function" || !hubId || !courseKey || !pkg) return false;
    try {
      storage.setItem(cacheKey(hubId, courseKey), JSON.stringify({
        hubId: hubId,
        courseKey: courseKey,
        packageVersion: row && row.package_version,
        schemaVersion: row && row.schema_version,
        sourcePackageVersion: row && row.source_package_version,
        contentHash: row && row.content_hash,
        publishedAt: row && row.published_at,
        cachedAt: new Date().toISOString(),
        package: pkg
      }));
      return true;
    } catch (error) {
      return false;
    }
  };

  ns.readCurriculumCache = function (storage, hubId, courseKey, validate) {
    var raw;
    var parsed;
    var validation;
    if (!storage || typeof storage.getItem !== "function" || !hubId || !courseKey) return null;
    try {
      raw = storage.getItem(cacheKey(hubId, courseKey));
      parsed = raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
    if (!parsed || parsed.hubId !== hubId || parsed.courseKey !== courseKey || !parsed.package) {
      return null;
    }
    if (typeof validate === "function") {
      validation = validate(parsed.package);
      if (!validation || validation.valid === false) return null;
    }
    return parsed;
  };

  ns.resolvePublicationState = function (local, rows, lookupError) {
    var publication;
    var row;
    if (lookupError) return result("ERROR", local, null);
    if (!local || !local.hubCode || !local.courseKey) {
      return result("ERROR", local, null);
    }
    if (local.schemaVersion && local.schemaVersion !== SUPPORTED_SCHEMA) {
      return result("INCOMPATIBLE", local, null);
    }
    if (local.contentPackageVersion && local.contentPackageVersion !== SUPPORTED_PACKAGE) {
      return result("INCOMPATIBLE", local, null);
    }
    row = firstRow(rows);
    publication = mapPublication(row);
    if (!publication) return result("NO_PUBLICATION", local, null);
    if (publication.schemaVersion !== SUPPORTED_SCHEMA || publication.sourcePackageVersion !== SUPPORTED_PACKAGE) {
      return result("INCOMPATIBLE", local, publication);
    }
    return result("PUBLISHED", local, publication);
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

  ns.fetchPublishedCurriculumPackage = function (options) {
    var config = (options && options.config) || {};
    var appConfig = (options && options.appConfig) || {};
    var local = (options && options.local) || {};
    var session = options && options.session;
    var fetchFn = (options && options.fetch) || root.fetch;
    var projectUrl = String(config.projectUrl || "").replace(/\/+$/, "");
    var key = config.publishableKey || "";
    var token = session && session.access_token ? session.access_token : key;
    var hubCode = local.hubCode || appConfig.hubId || "";
    var courseKey = local.courseKey || appConfig.courseKey || "";

    if (typeof fetchFn !== "function" || !projectUrl || !key || !hubCode || !courseKey) {
      return Promise.reject(new Error("publication-lookup-unavailable"));
    }

    return fetchFn(projectUrl + "/rest/v1/rpc/published_curriculum_package", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + token,
        "Content-Profile": "api",
        "Accept-Profile": "api",
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        p_hub_code: hubCode,
        p_course_key: courseKey
      })
    }).then(function (response) {
      if (!response || !response.ok) throw new Error("publication-lookup-failed");
      return response.json();
    }).then(function (payload) {
      var row = firstRow(payload);
      if (!row || !row.package) throw new Error("publication-lookup-empty");
      return row;
    });
  };

  ns.loadCurriculumRuntime = function (options) {
    var appConfig = (options && options.appConfig) || {};
    var loadBundled = options && options.loadBundled;
    var validate = options && options.validate;
    var storage = (options && options.storage) || (typeof root.localStorage !== "undefined" ? root.localStorage : null);
    var hubId = appConfig.hubId || "";
    var courseKey = appConfig.courseKey || "";

    function fallback(reason) {
      if (typeof loadBundled !== "function") {
        return Promise.reject(new Error(reason || "curriculum-unavailable"));
      }
      return Promise.resolve(loadBundled()).then(function (pkg) {
        var validation = typeof validate === "function" ? validate(pkg) : { valid: true };
        var cached;
        if (!validation || validation.valid === false) {
          cached = ns.readCurriculumCache(storage, hubId, courseKey, validate);
          if (cached && cached.package) {
            ns.setPublicationState(result("FALLBACK", localContext(cached.package, appConfig), mapPublication({
              hub_code: hubId,
              course_key: courseKey,
              package_version: cached.packageVersion,
              schema_version: cached.schemaVersion,
              source_package_version: cached.sourcePackageVersion,
              published_at: cached.publishedAt,
              content_hash: cached.contentHash
            })));
            currentState.reason = reason;
            return {
              source: "cache",
              package: cached.package,
              state: currentState,
              publication: currentState.publication
            };
          }
          throw new Error("bundled-package-invalid");
        }
        ns.setPublicationState(result("FALLBACK", localContext(pkg, appConfig), null));
        currentState.reason = reason;
        return {
          source: "bundled",
          package: pkg,
          state: currentState,
          publication: null
        };
      });
    }

    return ns.fetchPublishedCurriculumPackage(options).then(function (row) {
      var pkg = ns.hydratePublishedPackage(row);
      var validation = typeof validate === "function" ? validate(pkg) : { valid: true };
      if (!validation || validation.valid === false) {
        return fallback("invalid-package");
      }
      if (row.schema_version !== SUPPORTED_SCHEMA || row.source_package_version !== SUPPORTED_PACKAGE) {
        return fallback("incompatible");
      }
      ns.writeCurriculumCache(storage, hubId, courseKey, row, pkg);
      ns.setPublicationState(result("PUBLISHED", localContext(pkg, appConfig), mapPublication(row)));
      return {
        source: "published",
        package: pkg,
        state: currentState,
        publication: currentState.publication
      };
    }).catch(function () {
      var cached = ns.readCurriculumCache(storage, hubId, courseKey, validate);
      if (cached && cached.package) {
        ns.setPublicationState(result("FALLBACK", localContext(cached.package, appConfig), mapPublication({
          hub_code: hubId,
          course_key: courseKey,
          package_version: cached.packageVersion,
          schema_version: cached.schemaVersion,
          source_package_version: cached.sourcePackageVersion,
          published_at: cached.publishedAt,
          content_hash: cached.contentHash
        })));
        currentState.reason = "unavailable";
        return {
          source: "cache",
          package: cached.package,
          state: currentState,
          publication: currentState.publication
        };
      }
      return fallback("unavailable");
    });
  };

  ns.lookupPublicationState = function (options) {
    var local = (options && options.local) || localContext(options && options.package, options && options.appConfig);
    return ns.fetchPublishedCurriculumPackage(Object.assign({}, options, { local: local })).then(function (row) {
      return ns.setPublicationState(ns.resolvePublicationState(local, row, null));
    }).catch(function () {
      return ns.setPublicationState(ns.resolvePublicationState(local, [], true));
    });
  };

  ns.renderPublicationStatus = function (state) {
    if (!state) return "";
    if (state.state === "PUBLISHED") {
      return '<p class="visually-hidden" role="status" data-publication-state="PUBLISHED">' +
        LEARNER_COPY.PUBLISHED + "</p>";
    }
    return '<section class="publication-banner publication-banner--' + state.state.toLowerCase().replace(/_/g, "-") +
      '" role="status" data-publication-state="' + state.state + '">' +
      "<strong>" + LEARNER_LABELS[state.state] + "</strong>" +
      "<p>" + LEARNER_COPY[state.state] + "</p>" +
      "</section>";
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
