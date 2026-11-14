import { TectraDeepPartial, TectraPreset, TectraStyle } from '@tectra-ng/themes';
import { TxLocaleCode, TxLocaleDefinition, TxTranslations } from '@tectra-ng/core/i18n/types';
import { TxGlobalPassThrough, TxPassThroughOptions } from './pass-through.interface';

export type { TxLocaleCode, TxLocaleDefinition, TxTranslations };

/** Color scheme of the app. */
export type TxThemeMode = 'light' | 'dark';

/** Text of a validation error, or a function that builds it from the error value. */
export type TxValidationMessage = string | ((error: unknown) => string);
/** Validation error texts by error key. */
export type TxValidationMessages = Record<string, TxValidationMessage>;

/** Space in px that overlays leave free at the top and bottom of the viewport, for fixed bars. */
export interface TxViewportInsets {
  /** Space left free at the top, in px. */
  top?: number;
  /** Space left free at the bottom, in px. */
  bottom?: number;
}

/** App-wide settings of overlays. */
export interface TxOverlayConfig {
  /** Space overlays keep free at the viewport edges. */
  viewportInsets?: TxViewportInsets;
}

/** Overrides merged into the preset with `definePreset`, or a function that builds them from the preset. */
export type TxPresetOverrides = TectraDeepPartial<TectraPreset> | ((preset: TectraPreset) => TectraDeepPartial<TectraPreset>);

/** Config passed to `provideTectra`: theme, locale, ripple, pass-through and validation texts. */
export interface TectraConfig {
  /** Theme preset to apply. */
  preset: TectraPreset;
  /** The app's own changes to the preset; applied at start and again after every `TxThemeService.updateTheme`. */
  presetOverrides?: TxPresetOverrides;
  /** Local storage key that remembers the style, primary, surface, ripple and color scheme and restores them before the first render. */
  storageKey?: string;
  /** Styles a remembered choice may name; the style of `preset` is always known. */
  styles?: TectraStyle[];
  /** Initial color scheme (default `light`). */
  mode?: TxThemeMode;
  /** Extra CSS selector that also turns on dark tokens, e.g. `.app-dark`. */
  darkSelector?: string;
  /** Whether the click ripple effect is on by default (default `false`). */
  ripple?: boolean;
  /** Turns off the kit styles of every component that has no own `unstyled` input. */
  unstyled?: boolean;
  /** Global pass-through: classes and styles for parts of components, by component name. */
  pt?: TxGlobalPassThrough;
  /** Default merge rules of global and local pass-through. */
  ptOptions?: TxPassThroughOptions;
  /** Locale to use: a code of a built-in or added locale, or a whole locale definition. */
  locale?: TxLocaleCode | TxLocaleDefinition;
  /** Extra locale definitions to register. */
  locales?: TxLocaleDefinition[];
  /** Texts that override the ones of the current locale. */
  translations?: Partial<TxTranslations>;
  /** App-wide settings of overlays. */
  overlay?: TxOverlayConfig;
  /** Validation error texts by error key, shown by form field components. */
  validationMessages?: TxValidationMessages;
}
