/**
 * IANA timezone detection + validation.
 *
 * Adapted from NanoClaw (setup/timezone.ts + src/timezone.ts), but simplified
 * for Podium M1: we only need detection + validation helpers at bootstrap time.
 * A later module (M5/M6) will wire the interactive "prompt list" fallback into
 * the step runner if autodetect fails.
 */

/**
 * Check whether a timezone string is a valid IANA identifier
 * that Intl.DateTimeFormat can use.
 */
export function isValidTimezone(tz: string): boolean {
  try {
    // Throws RangeError on invalid/unsupported zone.
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Return the given timezone if valid IANA, otherwise fall back to UTC.
 */
export function resolveTimezone(tz: string | undefined | null): string {
  if (tz && isValidTimezone(tz)) return tz;
  return 'UTC';
}

/**
 * Best-effort autodetection via Intl. Returns undefined if the runtime
 * cannot resolve a zone (extremely rare on Node 20+).
 */
export function detectSystemTimezone(): string | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && isValidTimezone(tz)) return tz;
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * A tiny fallback prompt list used when autodetect returns nothing and we
 * need to ask the user. Later steps (M5/M6) import and render this.
 * Kept short and globally representative — the picker itself will accept
 * any valid IANA zone typed manually.
 */
export const FALLBACK_TIMEZONES: readonly string[] = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Jerusalem',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
];

/**
 * Convenience: resolve the best-available timezone with a final UTC floor.
 * Precedence: explicit argument > TZ env var > system autodetect > UTC.
 */
export function bestEffortTimezone(explicit?: string): string {
  const candidates = [explicit, process.env.TZ, detectSystemTimezone()];
  for (const c of candidates) {
    if (c && isValidTimezone(c)) return c;
  }
  return 'UTC';
}
