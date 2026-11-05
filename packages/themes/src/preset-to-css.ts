import { motion, radius, spacing, typography } from '@tectra/tokens';
import { TectraCssVariable, TectraPreset } from './types/preset.interface';

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function toCssVariables(tokens: object, prefix = '--tx'): TectraCssVariable[] {
  return Object.entries(tokens).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? toCssVariables(value, `${prefix}-${kebab(key)}`)
      : [{ name: `${prefix}-${kebab(key)}`, value: String(value) }],
  );
}

export function presetToCss(preset: TectraPreset): string {
  const shared = toCssVariables({ radius, space: spacing, font: typography, motion });
  const block = (variables: TectraCssVariable[]) => variables.map(({ name, value }) => `${name}: ${value};`).join(' ');

  return [
    `:root { ${block(shared)} ${block(toCssVariables(preset.light))} color-scheme: light; }`,
    `:root[data-tx-theme="dark"] { ${block(toCssVariables(preset.dark))} color-scheme: dark; }`,
  ].join('\n');
}
