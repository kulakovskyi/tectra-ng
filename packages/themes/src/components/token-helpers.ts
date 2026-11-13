/** CSS reference to a semantic token, like `var(--tx-surface-card)` for `surface-card`. */
/* @__NO_SIDE_EFFECTS__ */
export function tokenRef(name: string): string {
  return `var(--tx-${name})`;
}

/** CSS `light-dark()` value that picks the first color in light mode and the second in dark mode. */
/* @__NO_SIDE_EFFECTS__ */
export function lightDark(light: string, dark: string): string {
  return `light-dark(${light}, ${dark})`;
}

/** CSS `color-mix()` of a color with a base in sRGB; `amount` is the share of the color, like `8%`. */
/* @__NO_SIDE_EFFECTS__ */
export function mix(color: string, amount: string, base: string): string {
  return `color-mix(in srgb, ${color} ${amount}, ${base})`;
}

/** CSS color that makes a color transparent by the given share, like `fade(color, '90%')`. */
/* @__NO_SIDE_EFFECTS__ */
export function fade(color: string, transparency: string): string {
  return `color-mix(in srgb, ${color}, transparent ${transparency})`;
}

/** Returns a copy of a token object with extra tokens added. */
/* @__NO_SIDE_EFFECTS__ */
export function extendTokens<T extends object, U extends object>(base: T, extra: U): T & U {
  return { ...base, ...extra };
}

/** Joins CSS strings into one without a separator. */
/* @__NO_SIDE_EFFECTS__ */
export function joinCss(...parts: string[]): string {
  return parts.join('');
}

/** Intersection of the token objects in a tuple; the result type of `mergeTokens`. */
type MergedTokens<T extends object[]> = T extends [infer Head, ...infer Rest extends object[]] ? Head & MergedTokens<Rest> : unknown;

/** Merges token objects into one; later objects win on the same key (a shallow merge). */
/* @__NO_SIDE_EFFECTS__ */
export function mergeTokens<T extends object[]>(...parts: T): MergedTokens<T> {
  return Object.assign({}, ...parts) as MergedTokens<T>;
}
