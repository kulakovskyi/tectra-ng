import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TxThemeMode, TxThemeService } from '@tectra-ng/core/config';
import { TECTRA_STYLES, TectraStyleName, createTectraPreset } from '@tectra-ng/themes';
import { PRIMARY_ORDER, SEVERITY_PALETTES, SURFACE_PALETTES, TectraPrimary, TectraSurface } from '@tectra-ng/tokens';
import { logoSvg } from './logo-mark/logo-blocks.data';

export interface DocsThemeChoice {
  style: TectraStyleName;
  primary: TectraPrimary;
  surface: TectraSurface;
  ripple: boolean;
  mode: TxThemeMode;
}

const STORAGE_KEY = 'tx-docs-theme';

function mixHex(first: string, second: string, weight: number): string {
  const channel = (hex: string, index: number) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
  return `#${[0, 1, 2]
    .map((index) => Math.round(channel(first, index) * weight + channel(second, index) * (1 - weight)).toString(16).padStart(2, '0'))
    .join('')}`;
}

@Injectable({ providedIn: 'root' })
export class DocsThemeSettings {
  private txThemeService = inject(TxThemeService);
  private document = inject(DOCUMENT);

  readonly style = signal<TectraStyleName>('tectra');
  readonly primary = signal<TectraPrimary>('blue');
  readonly surface = signal<TectraSurface>('ink');
  readonly ripple = this.txThemeService.ripple;
  readonly mode = this.txThemeService.mode;

  restore(): void {
    this.document.documentElement.style.removeProperty('color-scheme');
    const saved = this.read();
    if (!saved) {
      return;
    }
    if (saved.mode === 'light' || saved.mode === 'dark') {
      this.txThemeService.setMode(saved.mode);
    }
    if (saved.style && saved.style in TECTRA_STYLES) {
      this.style.set(saved.style);
    }
    if (saved.primary && PRIMARY_ORDER.includes(saved.primary)) {
      this.primary.set(saved.primary);
    }
    if (saved.surface && saved.surface in SURFACE_PALETTES) {
      this.surface.set(saved.surface);
    }
    if (typeof saved.ripple === 'boolean') {
      this.txThemeService.setRipple(saved.ripple);
    }
    this.apply();
  }

  update(choice: Partial<Omit<DocsThemeChoice, 'ripple'>>): void {
    if (choice.style) {
      this.style.set(choice.style);
    }
    if (choice.primary) {
      this.primary.set(choice.primary);
    }
    if (choice.surface) {
      this.surface.set(choice.surface);
    }
    this.apply();
    this.save();
  }

  setRipple(enabled: boolean): void {
    this.txThemeService.setRipple(enabled);
    this.save();
  }

  toggleMode(): void {
    this.txThemeService.toggleMode();
    this.save();
  }

  private apply(): void {
    const preset = createTectraPreset({ style: this.style(), primary: this.primary(), surface: this.surface() });
    this.txThemeService.applyPreset(preset);
    const { base, contrast } = preset.light.primary;
    const svg = logoSvg({ tile: base, contrast, soft: mixHex(contrast, base, 0.72), accent: SEVERITY_PALETTES.orange[300] });
    this.document.querySelector('link[rel="icon"]')?.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(svg)}`);
  }

  private read(): Partial<DocsThemeChoice> | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Partial<DocsThemeChoice>) : null;
    } catch {
      return null;
    }
  }

  private save(): void {
    const choice: DocsThemeChoice = {
      style: this.style(),
      primary: this.primary(),
      surface: this.surface(),
      ripple: this.ripple(),
      mode: this.mode(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
    } catch {
      return;
    }
  }
}
