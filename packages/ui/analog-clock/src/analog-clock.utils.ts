import { TxAnalogClockHands } from './analog-clock.types';

export function validTimeZone(timezone: string | null | undefined): string | undefined {
  if (!timezone) return undefined;
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: timezone });
    return timezone;
  } catch {
    return undefined;
  }
}

export function clockHands(now: number | Date, timezone: string | null | undefined): TxAnalogClockHands {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: validTimeZone(timezone) })
      .formatToParts(new Date(now))
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

export function forwardAngle(previous: number | null, next: number): number {
  if (previous === null) return next;
  const turns = Math.floor(previous / 360);
  let angle = turns * 360 + next;
  if (angle < previous - 0.001) angle += 360;
  return angle;
}
