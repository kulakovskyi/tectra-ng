import { SEVERITY_PALETTES, layers, motion, radius, spacing, typography } from '@tectra-ng/tokens';
import { COMPONENT_TOKENS } from './components/component-tokens';
import { deepMerge } from './define-preset';
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

function block(variables: TectraCssVariable[]): string {
  return variables.map(({ name, value }) => `${name}: ${value};`).join(' ');
}

function sharedVariables(preset: TectraPreset): TectraCssVariable[] {
  return toCssVariables({
    radius,
    space: spacing,
    font: typography,
    motion,
    layer: layers,
    primary: preset.palettes.accent,
    surface: preset.palettes.surface,
    ...SEVERITY_PALETTES,
  });
}

function themeCss(preset: TectraPreset, components: TectraCssVariable[]): string {
  return [
    `:root { ${block(sharedVariables(preset))} ${block(toCssVariables(preset.light))} ${block(components)} color-scheme: light; }`,
    `:root[data-tx-theme="dark"] { ${block(toCssVariables(preset.dark))} color-scheme: dark; }`,
    ...(preset.css ? [preset.css] : []),
  ].join('\n');
}

export function componentVariables(name: string, tokens: object): TectraCssVariable[] {
  return toCssVariables(tokens, `--tx-${kebab(name)}`);
}

export function componentTokensCss(name: string, tokens: object): string {
  return `:root { ${block(componentVariables(name, tokens))} }`;
}

export function presetBaseCss(preset: TectraPreset): string {
  return themeCss(preset, []);
}

export function presetToCss(preset: TectraPreset): string {
  const components = deepMerge<object>(COMPONENT_TOKENS, preset.components);
  return themeCss(
    preset,
    Object.entries(components).flatMap(([name, tokens]) => componentVariables(name, tokens)),
  );
}
