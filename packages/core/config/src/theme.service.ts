import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TectraPreset, componentTokensCss, deepMerge, presetBaseCss } from '@tectra-ng/themes';
import { TxThemeMode } from './tectra-config.interface';
import { TECTRA_CONFIG } from './tectra-config.token';

export type TxComponentTokenGroups = Readonly<Record<string, object>>;

@Injectable({ providedIn: 'root' })
export class TxThemeService {
  private document = inject(DOCUMENT);
  private config = inject(TECTRA_CONFIG, { optional: true });
  private readonly groups = new Map<string, object>();

  readonly preset = signal<TectraPreset | null>(null);
  readonly mode = signal<TxThemeMode>('light');
  readonly ripple = signal(this.config?.ripple ?? false);

  applyPreset(preset: TectraPreset): void {
    const css = presetBaseCss(preset);
    const darkSelector = this.config?.darkSelector;
    this.style('tectra-theme').textContent = darkSelector ? css.replace(':root[data-tx-theme="dark"]', `:root[data-tx-theme="dark"], ${darkSelector}`) : css;
    this.preset.set(preset);
    for (const name of this.groups.keys()) {
      this.writeGroup(name);
    }
  }

  registerTokens(groups: TxComponentTokenGroups): void {
    for (const [name, tokens] of Object.entries(groups)) {
      if (!this.groups.has(name)) {
        this.groups.set(name, tokens);
        this.writeGroup(name);
      }
    }
  }

  registeredTokens(): string[] {
    return [...this.groups.keys()];
  }

  setRipple(enabled: boolean): void {
    this.ripple.set(enabled);
  }

  setMode(mode: TxThemeMode): void {
    this.document.documentElement.setAttribute('data-tx-theme', mode);
    this.mode.set(mode);
  }

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

export function injectTokens<T extends TxComponentTokenGroups>(groups: T): T {
  inject(TxThemeService).registerTokens(groups);
  return groups;
}
