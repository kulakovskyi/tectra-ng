import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TectraPreset, presetToCss } from '@tectra/themes';
import { TxThemeMode } from './tectra-config.interface';

@Injectable({ providedIn: 'root' })
export class TxThemeService {
  private document = inject(DOCUMENT);

  readonly preset = signal<TectraPreset | null>(null);
  readonly mode = signal<TxThemeMode>('light');

  applyPreset(preset: TectraPreset): void {
    const id = 'tectra-theme';
    const style = this.document.getElementById(id) ?? this.document.head.appendChild(this.document.createElement('style'));
    style.id = id;
    style.textContent = presetToCss(preset);
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
