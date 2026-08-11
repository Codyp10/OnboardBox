/**
 * Google / Meta OAuth service boundary.
 * Stubs authorization until real app credentials exist.
 * Never collect provider passwords.
 */

export type OAuthProvider =
  | "google_ads"
  | "google_analytics"
  | "google_search_console"
  | "google_business_profile"
  | "meta_ads";

export type OAuthStartResult = {
  mode: "stub" | "live";
  authorizationUrl: string;
  state: string;
};

function hasGoogleCredentials() {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );
}

function hasMetaCredentials() {
  return Boolean(
    process.env.META_OAUTH_APP_ID && process.env.META_OAUTH_APP_SECRET,
  );
}

export function startOAuth(provider: OAuthProvider, companyId: string): OAuthStartResult {
  const state = Buffer.from(
    JSON.stringify({ provider, companyId, nonce: Date.now() }),
  ).toString("base64url");

  const isGoogle = provider.startsWith("google");
  const live = isGoogle ? hasGoogleCredentials() : hasMetaCredentials();

  if (!live) {
    return {
      mode: "stub",
      authorizationUrl: `/api/oauth/${isGoogle ? "google" : "meta"}/callback?stub=1&state=${state}`,
      state,
    };
  }

  // Live URL construction would go here when credentials exist.
  return {
    mode: "live",
    authorizationUrl: `/api/oauth/${isGoogle ? "google" : "meta"}/callback?state=${state}`,
    state,
  };
}

export function parseOAuthState(state: string): {
  provider: OAuthProvider;
  companyId: string;
} | null {
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    if (!parsed.provider || !parsed.companyId) return null;
    return parsed;
  } catch {
    return null;
  }
}
