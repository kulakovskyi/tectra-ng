import { TxCountdownTarget, TxCountdownUnit } from './countdown.types';

export const TX_COUNTDOWN_UNIT_MS: Record<TxCountdownUnit, number> = {
  seconds: 1000,
  minutes: 60000,
  hours: 3600000,
  days: 86400000,
};

export function formatRemaining(ms: number | null | undefined): string {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function splitRemaining(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function targetTime(value: TxCountdownTarget): number | null {
  if (value === null || value === undefined || value === '') return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}
