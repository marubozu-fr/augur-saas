// Marker cookie that signals "Keep me signed in" was unchecked at sign-in.
// Set as a session cookie by the sign-in action and read by the middleware to
// keep refreshed auth cookies session-scoped. Shared here so the name stays in
// sync across both call sites.
export const NO_PERSIST_COOKIE = "augur-no-persist";

// Demo mode (DemoBanner, marketing footer): links to the public
// repositories, single source of truth so the URL only needs updating here.
export const AUGUR_SAAS_REPO_URL = "https://github.com/marubozu-fr/augur-saas";
export const AUGUR_ENGINE_REPO_URL = "https://github.com/marubozu-fr/augur";
export const AUGUR_SAAS_LICENSE_URL = `${AUGUR_SAAS_REPO_URL}/blob/main/LICENSE`;
