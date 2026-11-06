import { TestBed } from '@angular/core/testing';
import { Tectra, createTectraPreset } from '@tectra-ng/themes';
import { provideTectra } from './provide-tectra';
import { TxThemeService } from './theme.service';

describe('provideTectra', () => {
  afterEach(() => {
    document.getElementById('tectra-theme')?.remove();
    document.documentElement.removeAttribute('data-tx-theme');
  });

  it('writes the theme style and the mode', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, mode: 'dark' })] });
    const service = TestBed.inject(TxThemeService);
    expect(document.getElementById('tectra-theme')?.textContent).toContain('--tx-primary-base');
    expect(document.documentElement.getAttribute('data-tx-theme')).toBe('dark');
    expect(service.mode()).toBe('dark');
  });

  it('toggles the mode and swaps presets', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra })] });
    const service = TestBed.inject(TxThemeService);
    service.toggleMode();
    expect(service.mode()).toBe('dark');
    service.applyPreset(createTectraPreset({ primary: 'green' }));
    expect(service.preset()?.name).toBe('tectra-green-ink');
    expect(document.querySelectorAll('#tectra-theme').length).toBe(1);
  });

  it('adds the dark selector of the host app', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, darkSelector: '.app-dark' })] });
    TestBed.inject(TxThemeService);
    expect(document.getElementById('tectra-theme')?.textContent).toContain(':root[data-tx-theme="dark"], .app-dark');
  });
});
