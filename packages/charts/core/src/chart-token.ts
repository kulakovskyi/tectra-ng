/**
 * Reads a number or percent (as a ratio) from a CSS custom property of an element; the fallback when
 * it is missing.
 */
export function readTokenNumber(element: Element | null | undefined, name: string, fallback: number): number {
  const view = element?.ownerDocument?.defaultView;
  if (!element || !view) {
    return fallback;
  }
  const raw = view.getComputedStyle(element).getPropertyValue(name).trim();
  return parseRatio(raw, fallback);
}

/**
 * Reads a number or a percent string such as `40%` as a ratio (`0.4`); the fallback when it is not a
 * number.
 */
export function parseRatio(raw: string | number | null | undefined, fallback: number): number {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : fallback;
  }
  if (!raw) {
    return fallback;
  }
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return raw.trim().endsWith('%') ? value / 100 : value;
}
