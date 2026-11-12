import { TestBed } from '@angular/core/testing';
import { Soft, Tectra, buttonTokens, tagTokens } from '@tectra-ng/themes';
import { provideTectra } from './provide-tectra';
import { TxThemeService, injectTokens } from './theme.service';

const tokenStyles = () => [...document.querySelectorAll<HTMLStyleElement>('style[id^="tectra-tokens-"]')];

const clearStyles = () => document.querySelectorAll('#tectra-theme, style[id^="tectra-tokens-"]').forEach((style) => style.remove());

describe('TxThemeService component tokens', () => {
  beforeEach(clearStyles);
  afterEach(clearStyles);

  it('writes the preset without component tokens and each registered group once', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra })] });
    const service = TestBed.inject(TxThemeService);
    expect(document.getElementById('tectra-theme')?.textContent).not.toContain('--tx-button-');
    expect(tokenStyles()).toHaveLength(0);

    TestBed.runInInjectionContext(() => injectTokens({ button: buttonTokens, tag: tagTokens }));
    service.registerTokens({ button: buttonTokens });
    expect(tokenStyles().map((style) => style.id)).toEqual(['tectra-tokens-button', 'tectra-tokens-tag']);
    expect(document.getElementById('tectra-tokens-button')?.textContent).toContain(`--tx-button-border-radius: ${buttonTokens.root.borderRadius};`);
    expect(service.registeredTokens()).toEqual(['button', 'tag']);
  });

  it('rewrites the registered groups with the overrides of a new preset', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra })] });
    const service = TestBed.inject(TxThemeService);
    service.registerTokens({ button: buttonTokens });
    expect(document.getElementById('tectra-tokens-button')?.textContent).toContain(`--tx-button-padding-x: ${buttonTokens.root.paddingX};`);

    service.applyPreset(Soft);
    const soft = (Soft.components.button?.root?.paddingX ?? '') as string;
    expect(soft).not.toBe(buttonTokens.root.paddingX);
    expect(document.getElementById('tectra-tokens-button')?.textContent).toContain(`--tx-button-padding-x: ${soft};`);
    expect(tokenStyles()).toHaveLength(1);
  });

  it('writes the defaults of a group registered before any preset', () => {
    const service = TestBed.inject(TxThemeService);
    service.registerTokens({ tag: tagTokens });
    expect(document.getElementById('tectra-tokens-tag')?.textContent).toContain('--tx-tag-');
  });
});

describe('TxThemeService mode', () => {
  afterEach(() => document.documentElement.removeAttribute('data-tx-theme'));

  it('toggles between light and dark on the root element', () => {
    const service = TestBed.inject(TxThemeService);
    service.toggleMode();
    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-tx-theme')).toBe('dark');
    service.toggleMode();
    expect(service.mode()).toBe('light');
    expect(document.documentElement.getAttribute('data-tx-theme')).toBe('light');
  });
});
