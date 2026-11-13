import { SEVERITY_PALETTES, layers, motion, radius, spacing, typography } from '@tectra-ng/tokens';
import { COMPONENT_TOKENS } from './components/component-tokens';
import { deepMerge } from './define-preset';
import { TectraCssVariable, TectraPreset } from './types/preset.interface';

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Flattens a token object into CSS variables; nested keys join with dashes in kebab case and `root` stands
 * for the prefix itself (default `--tx`).
 */
export function toCssVariables(tokens: object, prefix = '--tx'): TectraCssVariable[] {
  return Object.entries(tokens).flatMap(([key, value]) => {
    const name = key === 'root' ? prefix : `${prefix}-${kebab(key)}`;
    return typeof value === 'object' && value !== null
      ? toCssVariables(value, name)
      : [{ name, value: String(value) }];
  });
}

/**
 * Turns a token object into a flat object of CSS variable names and values, for an inline `style` binding;
 * `{}` when there are no tokens.
 */
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

/** CSS variables of one component's tokens, named `--tx-<component>-…`. */
export function componentVariables(name: string, tokens: object): TectraCssVariable[] {
  return toCssVariables(tokens, `--tx-${kebab(name)}`);
}

/** CSS rule on `:root` with the variables of one component's tokens. */
export function componentTokensCss(name: string, tokens: object): string {
  return `:root { ${block(componentVariables(name, tokens))} }`;
}

/** CSS of a preset without component tokens: shared and semantic variables for light and dark and the extra CSS. */
export function presetBaseCss(preset: TectraPreset): string {
  return themeCss(preset, []);
}

/** Full CSS of a preset: the base CSS plus the variables of all component tokens with the preset overrides. */
export function presetToCss(preset: TectraPreset): string {
  const components = deepMerge<object>(COMPONENT_TOKENS, preset.components);
  return themeCss(
    preset,
    Object.entries(components).flatMap(([name, tokens]) => componentVariables(name, tokens)),
  );
}
