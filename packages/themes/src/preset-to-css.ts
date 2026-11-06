import { SEVERITY_PALETTES, layers, motion, radius, spacing, typography } from '@tectra-ng/tokens';
import { TectraCssVariable, TectraPreset } from './types/preset.interface';

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function toCssVariables(tokens: object, prefix = '--tx'): TectraCssVariable[] {
  return Object.entries(tokens).flatMap(([key, value]) => {
    const name = key === 'root' ? prefix : `${prefix}-${kebab(key)}`;
    return typeof value === 'object' && value !== null
      ? toCssVariables(value, name)
      : [{ name, value: String(value) }];
  });
}

export function toStyleObject(tokens: object | undefined, prefix: string): Record<string, string> {
  return tokens ? Object.fromEntries(toCssVariables(tokens, prefix).map(({ name, value }) => [name, value])) : {};
}

export function presetToCss(preset: TectraPreset): string {
  const block = (variables: TectraCssVariable[]) => variables.map(({ name, value }) => `${name}: ${value};`).join(' ');
  const shared = toCssVariables({
    radius,
    space: spacing,
    font: typography,
    motion,
    layer: layers,
    primary: preset.palettes.accent,
    surface: preset.palettes.surface,
    ...SEVERITY_PALETTES,
  });
  const components = Object.entries(preset.components).flatMap(([name, tokens]) => toCssVariables(tokens, `--tx-${kebab(name)}`));

  return [
    `:root { ${block(shared)} ${block(toCssVariables(preset.light))} ${block(components)} color-scheme: light; }`,
    `:root[data-tx-theme="dark"] { ${block(toCssVariables(preset.dark))} color-scheme: dark; }`,
  ].join('\n');
}
