/* @__NO_SIDE_EFFECTS__ */
export function tokenRef(name: string): string {
  return `var(--tx-${name})`;
}

/* @__NO_SIDE_EFFECTS__ */
export function lightDark(light: string, dark: string): string {
  return `light-dark(${light}, ${dark})`;
}

/* @__NO_SIDE_EFFECTS__ */
export function mix(color: string, amount: string, base: string): string {
  return `color-mix(in srgb, ${color} ${amount}, ${base})`;
}

/* @__NO_SIDE_EFFECTS__ */
export function fade(color: string, transparency: string): string {
  return `color-mix(in srgb, ${color}, transparent ${transparency})`;
}

/* @__NO_SIDE_EFFECTS__ */
export function extendTokens<T extends object, U extends object>(base: T, extra: U): T & U {
  return { ...base, ...extra };
}

/* @__NO_SIDE_EFFECTS__ */
export function joinCss(...parts: string[]): string {
  return parts.join('');
}
