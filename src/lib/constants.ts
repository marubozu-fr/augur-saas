// Marker cookie that signals "Keep me signed in" was unchecked at sign-in.
// Set as a session cookie by the sign-in action and read by the middleware to
// keep refreshed auth cookies session-scoped. Shared here so the name stays in
// sync across both call sites.
export const NO_PERSIST_COOKIE = "augur-no-persist";
