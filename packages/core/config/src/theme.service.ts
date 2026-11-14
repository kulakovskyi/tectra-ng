import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import {
  TectraPreset,
  TectraPresetSource,
  TectraStyle,
  componentTokensCss,
  createTectraPreset,
  deepMerge,
  definePreset,
  isTectraPrimary,
  isTectraSurface,
  presetBaseCss,
  tectraStyle,
} from '@tectra-ng/themes';
import { TectraConfig, TxThemeMode } from './tectra-config.interface';
import { TECTRA_CONFIG } from './tectra-config.token';

/** Component token groups by name, each an object of tokens. */
export type TxComponentTokenGroups = Readonly<Record<string, object>>;

/** What `updateTheme` changes: the style object, the primary color and the surface palette; parts left out stay as they are. */
export type TxThemeChoice = Partial<TectraPresetSource>;

interface TxSavedTheme {
  style?: unknown;
  primary?: unknown;
  surface?: unknown;
  ripple?: unknown;
  mode?: unknown;
}

/** Applies the preset and color scheme to the document and writes the CSS variables of component tokens. */
@Injectable({ providedIn: 'root' })
export class TxThemeService {
  private document = inject(DOCUMENT);
  private config = inject(TECTRA_CONFIG, { optional: true });
  private readonly groups = new Map<string, object>();

  /** The applied preset; `null` before the first one. */
  readonly preset = signal<TectraPreset | null>(null);
  /** The current color scheme. */
  readonly mode = signal<TxThemeMode>('light');
  /** Whether the click ripple effect is on. */
  readonly ripple = signal(this.config?.ripple ?? false);
  /** Style object of the applied preset; the default style when the preset was not built by `createTectraPreset`. */
  readonly style = computed(() => this.preset()?.source?.style ?? tectraStyle);
  /** Primary color of the applied preset (default `blue`). */
  readonly primary = computed(() => this.preset()?.source?.primary ?? 'blue');
  /** Surface palette of the applied preset (default `ink`). */
  readonly surface = computed(() => this.preset()?.source?.surface ?? 'ink');

  /**
   * Applies the config of `provideTectra`: the preset with `presetOverrides`, the color scheme, the ripple and the choice
   * remembered under `storageKey`. `provideTectra` calls it before the first render.
   */
  applyConfig(): void {
    const config = this.config;
    if (!config) {
      return;
    }
    const saved = this.readSaved(config.storageKey);
    this.applyPreset(this.restoredPreset(config, saved));
    this.ripple.set(typeof saved?.ripple === 'boolean' ? saved.ripple : (config.ripple ?? false));
    this.writeMode(saved?.mode === 'light' || saved?.mode === 'dark' ? saved.mode : (config.mode ?? 'light'));
  }

  /** Writes the CSS variables of a preset and rewrites the registered component tokens with its overrides. */
  applyPreset(preset: TectraPreset): void {
    const css = presetBaseCss(preset);
    const darkSelector = this.config?.darkSelector;
    this.styleElement('tectra-theme').textContent = darkSelector ? css.replace(':root[data-tx-theme="dark"]', `:root[data-tx-theme="dark"], ${darkSelector}`) : css;
    this.preset.set(preset);
    for (const name of this.groups.keys()) {
      this.writeGroup(name);
    }
  }

  /**
   * Rebuilds the preset with `createTectraPreset` from a new style, primary color or surface palette, applies the
   * `presetOverrides` of the config on top and remembers the choice under `storageKey`.
   */
  updateTheme(choice: TxThemeChoice): void {
    const preset = createTectraPreset({ style: choice.style ?? this.style(), primary: choice.primary ?? this.primary(), surface: choice.surface ?? this.surface() });
    this.applyPreset(this.withOverrides(preset));
    this.save();
  }

  /** Registers component token groups and writes their CSS variables; groups already registered are skipped. */
  registerTokens(groups: TxComponentTokenGroups): void {
    for (const [name, tokens] of Object.entries(groups)) {
      if (!this.groups.has(name)) {
        this.groups.set(name, tokens);
        this.writeGroup(name);
      }
    }
  }

  /** Names of the registered component token groups. */
  registeredTokens(): string[] {
    return [...this.groups.keys()];
  }

  /** Turns the click ripple effect on or off and remembers it under `storageKey`. */
  setRipple(enabled: boolean): void {
    this.ripple.set(enabled);
    this.save();
  }

  /** Sets the color scheme on the `<html>` element and remembers it under `storageKey`. */
  setMode(mode: TxThemeMode): void {
    this.writeMode(mode);
    this.save();
  }

  /** Switches between light and dark. */
  toggleMode(): void {
    this.setMode(this.mode() === 'light' ? 'dark' : 'light');
  }

  private restoredPreset(config: TectraConfig, saved: TxSavedTheme | null): TectraPreset {
    const base = config.preset.source;
    const style = [base?.style, ...(config.styles ?? [])].find((known): known is TectraStyle => !!known && known.name === saved?.style) ?? base?.style;
    const primary = isTectraPrimary(saved?.primary) ? saved.primary : base?.primary;
    const surface = isTectraSurface(saved?.surface) ? saved.surface : base?.surface;
    const changed = !!saved && (style !== base?.style || primary !== base?.primary || surface !== base?.surface);
    return this.withOverrides(changed ? createTectraPreset({ style, primary, surface }) : config.preset);
  }

  private withOverrides(preset: TectraPreset): TectraPreset {
    const overrides = this.config?.presetOverrides;
    return overrides ? definePreset(preset, typeof overrides === 'function' ? overrides(preset) : overrides) : preset;
  }

  private writeMode(mode: TxThemeMode): void {
    this.document.documentElement.setAttribute('data-tx-theme', mode);
    this.mode.set(mode);
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private readSaved(key: string | undefined): TxSavedTheme | null {
    if (!key) {
      return null;
    }
    try {
      const saved: unknown = JSON.parse(this.storage()?.getItem(key) ?? 'null');
      return saved && typeof saved === 'object' ? (saved as TxSavedTheme) : null;
    } catch {
      return null;
    }
  }

  private save(): void {
    const key = this.config?.storageKey;
    if (!key) {
      return;
    }
    const saved: TxSavedTheme = { style: this.style().name, primary: this.primary(), surface: this.surface(), ripple: this.ripple(), mode: this.mode() };
    try {
      this.storage()?.setItem(key, JSON.stringify(saved));
    } catch {
      return;
    }
  }

  private writeGroup(name: string): void {
    const overrides = (this.preset()?.components as Record<string, object | undefined> | undefined)?.[name];
    this.styleElement(`tectra-tokens-${name}`).textContent = componentTokensCss(name, deepMerge(this.groups.get(name) as object, overrides));
  }

  private styleElement(id: string): HTMLStyleElement {
    const existing = this.document.getElementById(id) as HTMLStyleElement | null;
    if (existing) {
      return existing;
    }
    const style = this.document.createElement('style');
    style.id = id;
    return this.document.head.appendChild(style);
  }
}

/** Registers the component token groups of a component and returns them; call in an injection context. */
export function injectTokens<T extends TxComponentTokenGroups>(groups: T): T {
  inject(TxThemeService).registerTokens(groups);
  return groups;
}
