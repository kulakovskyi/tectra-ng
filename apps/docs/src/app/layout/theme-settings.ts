import { Injectable, inject, signal } from '@angular/core';
import { TxThemeService } from '@tectra-ng/core/config';
import { TECTRA_STYLES, TectraStyleName, createTectraPreset } from '@tectra-ng/themes';
import { PRIMARY_ORDER, SURFACE_PALETTES, TectraPrimary, TectraSurface } from '@tectra-ng/tokens';

export interface DocsThemeChoice {
  style: TectraStyleName;
  primary: TectraPrimary;
  surface: TectraSurface;
  ripple: boolean;
}

const STORAGE_KEY = 'tx-docs-theme';

@Injectable({ providedIn: 'root' })
export class DocsThemeSettings {
  private txThemeService = inject(TxThemeService);

  readonly style = signal<TectraStyleName>('tectra');
  readonly primary = signal<TectraPrimary>('blue');
  readonly surface = signal<TectraSurface>('ink');
  readonly ripple = this.txThemeService.ripple;

  restore(): void {
    const saved = this.read();
    if (!saved) {
      return;
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

  private apply(): void {
    this.txThemeService.applyPreset(createTectraPreset({ style: this.style(), primary: this.primary(), surface: this.surface() }));
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
    const choice: DocsThemeChoice = { style: this.style(), primary: this.primary(), surface: this.surface(), ripple: this.ripple() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
    } catch {
      return;
    }
  }
}
