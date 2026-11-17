import { TestBed } from '@angular/core/testing';
import { Tectra, buttonTokens } from '@tectra-ng/themes';
import { provideTectra } from './provide-tectra';
import { TxThemeService } from './theme.service';

const clearStyles = () => document.querySelectorAll('#tectra-theme, style[id^="tectra-tokens-"]').forEach((style) => style.remove());

describe('provideTectra css options', () => {
  beforeEach(clearStyles);
  afterEach(clearStyles);

  it('writes extra palettes and rem sizes in the theme and in every component group', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, palettes: ['teal'], units: 'rem', rootFontSize: 14 })] });
    const service = TestBed.inject(TxThemeService);
    const theme = () => document.getElementById('tectra-theme')?.textContent ?? '';
    expect(theme()).toContain('--tx-teal-500:');
    expect(theme()).toContain('--tx-font-size-md: 1rem;');
    service.registerTokens({ button: buttonTokens });
    expect(document.getElementById('tectra-tokens-button')?.textContent).toContain('--tx-button-padding-x: 0.8571rem;');
    service.updateTheme({ primary: 'violet' });
    expect(theme()).toContain('--tx-teal-500:');
    expect(theme()).toContain('--tx-radius-md: 0.5rem;');
  });

  it('keeps px and writes no extra palettes by default', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra })] });
    TestBed.inject(TxThemeService);
    expect(document.getElementById('tectra-theme')?.textContent).toContain('--tx-radius-md: 7px;');
    expect(document.getElementById('tectra-theme')?.textContent).not.toContain('--tx-teal-500:');
  });
});
