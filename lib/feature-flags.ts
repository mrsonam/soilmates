/**
 * Environment-based feature flags (no remote config).
 * All default to enabled unless explicitly set to "false".
 */

function flagEnabled(envVal: string | undefined, defaultOn = true): boolean {
  if (envVal == null || envVal === "") return defaultOn;
  const v = envVal.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "off") return false;
  if (v === "true" || v === "1" || v === "on") return true;
  return defaultOn;
}

export type FeatureFlags = {
  aiDiagnosis: boolean;
  aiAssistant: boolean;
  pushNotifications: boolean;
  offlineSync: boolean;
};

/** Server + client (NEXT_PUBLIC_). */
export function getFeatureFlags(): FeatureFlags {
  return {
    aiDiagnosis: flagEnabled(process.env.NEXT_PUBLIC_FEATURE_AI_DIAGNOSIS),
    aiAssistant: flagEnabled(process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT),
    pushNotifications: flagEnabled(process.env.NEXT_PUBLIC_FEATURE_PUSH),
    offlineSync: flagEnabled(process.env.NEXT_PUBLIC_FEATURE_OFFLINE_SYNC),
  };
}
