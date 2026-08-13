/**
 * Unit 14 Software Engineering for Business Hub — public Supabase browser configuration.
 *
 * Only browser-safe values may live in this file:
 *   - project URL
 *   - publishable (anon) browser key
 *
 * Never commit a service-role key, database password, CLI credential
 * or any secret. Learner identity is derived from Supabase Auth by the
 * shared backend. This hub queries only the learner-safe `api` schema
 * through learning-platform-core.
 *
 * Public curriculum pages render without signing in. Hosted credentials
 * are not required for local static testing of teaching routes.
 */
(function () {
  "use strict";

  window.SUPABASE_CONFIG = Object.freeze({
    projectUrl: "https://hubwpkrqndorznwzvaer.supabase.co",
    publishableKey: "sb_publishable_SlcVwn-vjm-hTUZlC_UH7g_V3GedixM",
    apiSchema: "api"
  });
})();
