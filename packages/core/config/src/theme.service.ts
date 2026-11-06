import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TectraPreset, presetToCss } from '@tectra-ng/themes';
import { TxThemeMode } from './tectra-config.interface';
import { TECTRA_CONFIG } from './tectra-config.token';

@Injectable({ providedIn: 'root' })
export class TxThemeService {
  private document = inject(DOCUMENT);
  private config = inject(TECTRA_CONFIG, { optional: true });

  readonly preset = signal<TectraPreset | null>(null);
  readonly mode = signal<TxThemeMode>('light');

  applyPreset(preset: TectraPreset): void {
    const id = 'tectra-theme';
    const style = this.document.getElementById(id) ?? this.document.head.appendChild(this.document.createElement('style'));
    style.id = id;
    const css = presetToCss(preset);
    const darkSelector = this.config?.darkSelector;
    style.textContent = darkSelector ? css.replace(':root[data-tx-theme="dark"]', `:root[data-tx-theme="dark"], ${darkSelector}`) : css;
    this.preset.set(preset);
  }

  setMode(mode: TxThemeMode): void {
    this.document.documentElement.setAttribute('data-tx-theme', mode);
    this.mode.set(mode);
  }

  toggleMode(): void {
    this.setMode(this.mode() === 'light' ? 'dark' : 'light');
  }
}
