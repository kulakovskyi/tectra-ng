import { ACCENT_PALETTES, SEVERITY_PALETTES, TectraColorScale, layers, motion, radius, spacing, typography } from '@tectra-ng/tokens';
import { COMPONENT_TOKENS } from './components/component-tokens';
import { deepMerge } from './define-preset';
import { TectraCssOptions } from './types/css-options.interface';
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

const PX_SIZE = /(?<![\w.#-])(-?(?:\d+(?:\.\d+)?|\.\d+))px\b/g;

/**
 * Writes every px size in a CSS value as rem, counted from the root font size (default 16); sizes of 1px and less stay
 * in px, so `1px solid` borders stay sharp.
 */
export function pxToRem(value: string, rootFontSize = 16): string {
  return value.replace(PX_SIZE, (size, amount: string) => (Math.abs(Number(amount)) <= 1 ? size : `${+(Number(amount) / rootFontSize).toFixed(4)}rem`));
}

function block(variables: TectraCssVariable[], options: TectraCssOptions): string {
  const write = options.units === 'rem' ? (value: string) => pxToRem(value, options.rootFontSize) : (value: string) => value;
  return variables.map(({ name, value }) => `${name}: ${write(value)};`).join(' ');
}

function extraPalettes(options: TectraCssOptions): Record<string, TectraColorScale> {
  const names = (options.palettes ?? []).filter((name) => name in ACCENT_PALETTES && !(name in SEVERITY_PALETTES));
  return Object.fromEntries(names.map((name) => [name, ACCENT_PALETTES[name]]));
}

function sharedVariables(preset: TectraPreset, options: TectraCssOptions): TectraCssVariable[] {
  return toCssVariables({
    radius,
    space: spacing,
    font: typography,
    motion,
    layer: layers,
    primary: preset.palettes.accent,
    surface: preset.palettes.surface,
    ...SEVERITY_PALETTES,
    ...extraPalettes(options),
  });
}

function themeCss(preset: TectraPreset, components: TectraCssVariable[], options: TectraCssOptions): string {
  return [
    `:root { ${block(sharedVariables(preset, options), options)} ${block(toCssVariables(preset.light), options)} ${block(components, options)} color-scheme: light; }`,
    `:root[data-tx-theme="dark"] { ${block(toCssVariables(preset.dark), options)} color-scheme: dark; }`,
    ...(preset.css ? [preset.css] : []),
  ].join('\n');
}

/** CSS variables of one component's tokens, named `--tx-<component>-…`. */
export function componentVariables(name: string, tokens: object): TectraCssVariable[] {
  return toCssVariables(tokens, `--tx-${kebab(name)}`);
}

/** CSS rule on `:root` with the variables of one component's tokens; `options.units` sets the unit of sizes. */
export function componentTokensCss(name: string, tokens: object, options: TectraCssOptions = {}): string {
  return `:root { ${block(componentVariables(name, tokens), options)} }`;
}

/**
 * CSS of a preset without component tokens: shared and semantic variables for light and dark and the extra CSS;
 * `options` adds accent palettes and sets the unit of sizes.
 */
export function presetBaseCss(preset: TectraPreset, options: TectraCssOptions = {}): string {
  return themeCss(preset, [], options);
}

/**
 * Full CSS of a preset: the base CSS plus the variables of all component tokens with the preset overrides; `options`
 * adds accent palettes and sets the unit of sizes.
 */
export function presetToCss(preset: TectraPreset, options: TectraCssOptions = {}): string {
  const components = deepMerge<object>(COMPONENT_TOKENS, preset.components);
  return themeCss(
    preset,
    Object.entries(components).flatMap(([name, tokens]) => componentVariables(name, tokens)),
    options,
  );
}
