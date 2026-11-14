import { TestBed } from '@angular/core/testing';
import { Soft, Tectra, buttonTokens, createTectraPreset, edgeStyle, paperStyle, softStyle, tagTokens, tectraStyle } from '@tectra-ng/themes';
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

describe('TxThemeService theme choice', () => {
  const key = 'tx-theme-spec';

  afterEach(() => {
    vi.restoreAllMocks();
    clearStyles();
    localStorage.removeItem(key);
    document.documentElement.removeAttribute('data-tx-theme');
  });

  it('exposes the choice of the preset and falls back to the defaults', () => {
    const service = TestBed.inject(TxThemeService);
    expect(service.style()).toBe(tectraStyle);
    expect(service.primary()).toBe('blue');
    expect(service.surface()).toBe('ink');
    service.applyConfig();
    expect(service.preset()).toBeNull();
    service.applyPreset({ ...Tectra, source: undefined });
    expect(service.primary()).toBe('blue');
  });

  it('rebuilds the preset from a new choice and keeps the overrides of the app', () => {
    TestBed.configureTestingModule({
      providers: [provideTectra({ preset: createTectraPreset({ style: softStyle }), presetOverrides: { light: { primary: { contrast: 'black' } } } })],
    });
    const service = TestBed.inject(TxThemeService);
    expect(service.style()).toBe(softStyle);
    expect(service.preset()?.light.primary.contrast).toBe('black');

    service.updateTheme({ primary: 'teal' });
    expect(service.preset()?.name).toBe('soft-teal-ink');
    expect(service.preset()?.light.primary.contrast).toBe('black');
    service.updateTheme({ style: edgeStyle, surface: 'zinc' });
    expect(service.preset()?.name).toBe('edge-teal-zinc');
    expect([service.style(), service.primary(), service.surface()]).toEqual([edgeStyle, 'teal', 'zinc']);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('builds the overrides from the preset with a function', () => {
    TestBed.configureTestingModule({
      providers: [provideTectra({ preset: Tectra, presetOverrides: (preset) => ({ light: { primary: { contrast: preset.palettes.accent[50] } } }) })],
    });
    const service = TestBed.inject(TxThemeService);
    service.updateTheme({ primary: 'rose' });
    expect(service.preset()?.light.primary.contrast).toBe(service.preset()?.palettes.accent[50]);
  });

  it('remembers the choice, the ripple and the mode under the storage key', () => {
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, storageKey: key, ripple: true })] });
    const service = TestBed.inject(TxThemeService);
    expect(localStorage.getItem(key)).toBeNull();
    expect(service.ripple()).toBe(true);
    service.updateTheme({ style: paperStyle, primary: 'violet' });
    service.setRipple(false);
    service.toggleMode();
    expect(JSON.parse(localStorage.getItem(key) ?? '')).toEqual({ style: 'paper', primary: 'violet', surface: 'ink', ripple: false, mode: 'dark' });
  });

  it('restores a remembered choice before the first render', () => {
    localStorage.setItem(key, JSON.stringify({ style: 'paper', primary: 'violet', surface: 'zinc', ripple: false, mode: 'dark' }));
    TestBed.configureTestingModule({
      providers: [provideTectra({ preset: Tectra, storageKey: key, styles: [softStyle, paperStyle], ripple: true, presetOverrides: { css: '.own {}' } })],
    });
    const service = TestBed.inject(TxThemeService);
    expect(service.preset()?.name).toBe('paper-violet-zinc');
    expect(service.preset()?.css).toBe('.own {}');
    expect(service.ripple()).toBe(false);
    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-tx-theme')).toBe('dark');
  });

  it('keeps the preset of the config when the remembered choice is the same or unknown', () => {
    const preset = { ...Tectra, css: '.kept {}' };
    localStorage.setItem(key, JSON.stringify({ style: 'neon', primary: 'plaid', surface: 7, ripple: 'yes', mode: 'dim' }));
    TestBed.configureTestingModule({ providers: [provideTectra({ preset, storageKey: key, mode: 'dark' })] });
    const service = TestBed.inject(TxThemeService);
    expect(service.preset()).toBe(preset);
    expect(service.ripple()).toBe(false);
    expect(service.mode()).toBe('dark');
  });

  it('ignores broken or missing storage', () => {
    localStorage.setItem(key, '{not json');
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, storageKey: key })] });
    expect(TestBed.inject(TxThemeService).preset()).toBe(Tectra);
    TestBed.resetTestingModule();
    localStorage.setItem(key, '"text"');
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, storageKey: key })] });
    const service = TestBed.inject(TxThemeService);
    expect(service.preset()).toBe(Tectra);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => service.setRipple(true)).not.toThrow();
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => service.updateTheme({ primary: 'green' })).not.toThrow();
    expect(service.primary()).toBe('green');
  });
});
