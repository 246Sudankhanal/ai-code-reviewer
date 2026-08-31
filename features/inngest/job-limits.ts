/** Extra Inngest attempts after the first run (4 tries total). SDK default is 3. */
export const INNGEST_STEP_RETRIES = 3;

/**
 * Cancel the function if it has not finished by then.
 * Exhausted retries still call `onFailure` (DB → failed). A timeout cancel
 * does not; the dashboard Stop button writes failed if the row is still in-flight.
 */
export const INNGEST_FINISH_TIMEOUT = "5m" as const;

/** Dashboard poll while status is pending/syncing/processing. */
export const UI_IN_FLIGHT_POLL_MS = 3_000;

/** Stop polling even if status never leaves in-flight (matches finish timeout). */
export const UI_IN_FLIGHT_POLL_MAX_MS = 5 * 60 * 1000;

const pollStartedAtByQuery = new WeakMap<object, number>();

export function inFlightPollInterval(
  inFlight: boolean,
  pollingStartedAt: number | null
): number | false {
  if (!inFlight) {
    return false;
  }

  if (
    pollingStartedAt !== null &&
    Date.now() - pollingStartedAt > UI_IN_FLIGHT_POLL_MAX_MS
  ) {
    return false;
  }

  return UI_IN_FLIGHT_POLL_MS;
}

/** Cap polling at {@link UI_IN_FLIGHT_POLL_MAX_MS} from the first in-flight observation. */
export function pollWhileInFlight(query: object, inFlight: boolean): number | false {
  if (!inFlight) {
    pollStartedAtByQuery.delete(query);
    return false;
  }

  if (!pollStartedAtByQuery.has(query)) {
    pollStartedAtByQuery.set(query, Date.now());
  }

  return inFlightPollInterval(true, pollStartedAtByQuery.get(query) ?? null);
}
