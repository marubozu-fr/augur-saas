// Shared error type for the Augur data layer. Lives in its own module (rather
// than in src/services/augur.ts) so that both the live-API client
// (src/services/augur.ts) and the demo-mode snapshot reader
// (src/services/augur-snapshot.ts) can throw/catch it without a circular
// import between the two.

export class AugurApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AugurApiError";
  }
}
