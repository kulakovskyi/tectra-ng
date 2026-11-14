import { DOCUMENT, Injectable, PLATFORM_ID, computed, effect, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TxThemeMode, TxThemeService } from '@tectra-ng/core/config';
import { TECTRA_STYLES, Tectra, TectraStyleName } from '@tectra-ng/themes';
import { SEVERITY_PALETTES, TectraPrimary, TectraSurface } from '@tectra-ng/tokens';
import { logoSvg } from './logo-mark/logo-blocks.data';

export interface DocsThemeChoice {
  style: TectraStyleName;
  primary: TectraPrimary;
  surface: TectraSurface;
  ripple: boolean;
  mode: TxThemeMode;
}

export const DOCS_THEME_STORAGE_KEY = 'tx-docs-theme';
export const DOCS_THEME_STYLES = Object.values(TECTRA_STYLES);

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
  private browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly style = computed(() => this.txThemeService.style().name as TectraStyleName);
  readonly primary = this.txThemeService.primary;
  readonly surface = this.txThemeService.surface;
  readonly ripple = this.txThemeService.ripple;
  readonly mode = this.txThemeService.mode;

  constructor() {
    effect(() => {
      const preset = this.txThemeService.preset();
      if (this.browser && preset && preset !== Tectra) {
        const { base, contrast } = preset.light.primary;
        const svg = logoSvg({ tile: base, contrast, soft: mixHex(contrast, base, 0.72), accent: SEVERITY_PALETTES.orange[300] });
        this.document.querySelector('link[rel="icon"][type="image/svg+xml"]')?.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(svg)}`);
      }
    });
  }

  restore(): void {
    this.document.documentElement.style.removeProperty('color-scheme');
  }

  update(choice: Partial<Omit<DocsThemeChoice, 'ripple' | 'mode'>>): void {
    this.txThemeService.updateTheme({ style: choice.style && TECTRA_STYLES[choice.style], primary: choice.primary, surface: choice.surface });
  }

  setRipple(enabled: boolean): void {
    this.txThemeService.setRipple(enabled);
  }

  toggleMode(): void {
    this.txThemeService.toggleMode();
  }
}
