export function readTokenNumber(element: Element | null | undefined, name: string, fallback: number): number {
  const view = element?.ownerDocument?.defaultView;
  if (!element || !view) {
    return fallback;
  }
  const raw = view.getComputedStyle(element).getPropertyValue(name).trim();
  return parseRatio(raw, fallback);
}

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
