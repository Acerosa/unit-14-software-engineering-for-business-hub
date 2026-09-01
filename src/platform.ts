import { createPlatform } from "@learning-platform/core";
import { createClient } from "@supabase/supabase-js";
import { APP_CONFIG } from "./config";
import { createSitePath } from "./paths";
import { SUPABASE_CONFIG } from "./supabase-config";

export function createHubPlatform(root: string, createPlatformFn = createPlatform) {
  return createPlatformFn({
    hubCode: APP_CONFIG.hubId,
    hubName: APP_CONFIG.siteName,
    platformVersion: APP_CONFIG.coreVersion,
    accountPath: createSitePath(root, "account/"),
    hubRootPath: createSitePath(root),
    supabase: {
      projectUrl: SUPABASE_CONFIG.projectUrl,
      publishableKey: SUPABASE_CONFIG.publishableKey
    },
    navigation: APP_CONFIG.navigation.map((item) => ({
      ...item,
      path: item.id === "home" ? createSitePath(root) : createSitePath(root, item.path)
    })),
    navigationMode: "as-supplied",
    features: APP_CONFIG.features,
    theme: APP_CONFIG.theme
  }, { createClient });
}

export type HubPlatform = ReturnType<typeof createHubPlatform>;
