import { TxAnalogClockHands, TxAnalogClockTime } from './analog-clock.types';

/** Returns the time zone when the browser knows it, otherwise `undefined`. */
export function validTimeZone(timezone: string | null | undefined): string | undefined {
  if (!timezone) return undefined;
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: timezone });
    return timezone;
  } catch {
    return undefined;
  }
}

/** Turns a `Date`, milliseconds or an ISO string into milliseconds; `null` when it is empty or not a valid time. */
export function clockTime(value: TxAnalogClockTime): number | null {
  if (value === null || value === undefined || value === '') return null;
  const time = value instanceof Date ? value.getTime() : typeof value === 'string' ? Date.parse(value) : value;
  return Number.isFinite(time) ? time : null;
}

/**
 * Computes the text time and the hand angles of a moment in the given time zone; the local zone is used when it is empty or unknown.
 */
export function clockHands(now: number | Date | string, timezone: string | null | undefined): TxAnalogClockHands {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: validTimeZone(timezone) })
      .formatToParts(new Date(clockTime(now) ?? Date.now()))
      .map((part) => [part.type, part.value]),
  );
  const hours = Number(parts['hour']);
  const minutes = Number(parts['minute']);
  const seconds = Number(parts['second']);
  return {
    time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    hourAngle: ((hours % 12) + minutes / 60) * 30,
    minuteAngle: minutes * 6,
    secondAngle: seconds * 6,
  };
}

/**
 * Turns the next hand angle into one that never goes back past the previous angle, so a hand animates through 360 instead of rewinding.
 */
export function forwardAngle(previous: number | null, next: number): number {
  if (previous === null) return next;
  const turns = Math.floor(previous / 360);
  let angle = turns * 360 + next;
  if (angle < previous - 0.001) angle += 360;
  return angle;
}
