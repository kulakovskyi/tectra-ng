import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TectraPreset, componentTokensCss, deepMerge, presetBaseCss } from '@tectra-ng/themes';
import { TxThemeMode } from './tectra-config.interface';
import { TECTRA_CONFIG } from './tectra-config.token';

/** Component token groups by name, each an object of tokens. */
export type TxComponentTokenGroups = Readonly<Record<string, object>>;

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

  /** Writes the CSS variables of a preset and rewrites the registered component tokens with its overrides. */
  applyPreset(preset: TectraPreset): void {
    const css = presetBaseCss(preset);
    const darkSelector = this.config?.darkSelector;
    this.style('tectra-theme').textContent = darkSelector ? css.replace(':root[data-tx-theme="dark"]', `:root[data-tx-theme="dark"], ${darkSelector}`) : css;
    this.preset.set(preset);
    for (const name of this.groups.keys()) {
      this.writeGroup(name);
    }
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

  /** Turns the click ripple effect on or off. */
  setRipple(enabled: boolean): void {
    this.ripple.set(enabled);
  }

  /** Sets the color scheme on the `<html>` element. */
  setMode(mode: TxThemeMode): void {
    this.document.documentElement.setAttribute('data-tx-theme', mode);
    this.mode.set(mode);
  }

  /** Switches between light and dark. */
  toggleMode(): void {
    this.setMode(this.mode() === 'light' ? 'dark' : 'light');
  }

  private writeGroup(name: string): void {
    const overrides = (this.preset()?.components as Record<string, object | undefined> | undefined)?.[name];
    this.style(`tectra-tokens-${name}`).textContent = componentTokensCss(name, deepMerge(this.groups.get(name) as object, overrides));
  }

  private style(id: string): HTMLStyleElement {
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
