export function tokenRef(name: string): string {
  return `var(--tx-${name})`;
}

export function lightDark(light: string, dark: string): string {
  return `light-dark(${light}, ${dark})`;
}

export function mix(color: string, amount: string, base: string): string {
  return `color-mix(in srgb, ${color} ${amount}, ${base})`;
}

export function fade(color: string, transparency: string): string {
  return `color-mix(in srgb, ${color}, transparent ${transparency})`;
}
