import { ACCENT_PALETTES, SURFACE_PALETTES } from '@tectra-ng/tokens';
import { deepMerge, definePreset } from './define-preset';
import { Soft, Tectra, createTectraPreset } from './presets/tectra.preset';

describe('deepMerge', () => {
  it('keeps sibling keys when overriding a nested one', () => {
    expect(deepMerge({ a: { b: 1, c: 2 }, d: 3 }, { a: { b: 9 } })).toEqual({ a: { b: 9, c: 2 }, d: 3 });
  });

  it('returns the base without overrides', () => {
    const base = { a: 1 };
    expect(deepMerge(base, undefined)).toBe(base);
  });
});

describe('definePreset', () => {
  it('overrides one component token and keeps the rest', () => {
    const preset = definePreset(Soft, { components: { button: { root: { borderRadius: '0' } } } });
    expect(preset.components.button?.root?.borderRadius).toBe('0');
    expect(preset.components.button?.root?.paddingX).toBe(Soft.components.button?.root?.paddingX);
    expect(preset.light).toBe(Soft.light);
    expect(Tectra.components).toEqual({});
  });
});

describe('createTectraPreset', () => {
  it('builds primary from the accent palette', () => {
    const preset = createTectraPreset({ primary: 'teal' });
    expect(preset.name).toBe('tectra-teal-ink');
    expect(preset.light.primary.base).toBe(ACCENT_PALETTES.teal[600]);
    expect(preset.dark.primary.base).toBe(ACCENT_PALETTES.teal[400]);
  });

  it('defaults to the tectra style, blue and ink', () => {
    expect(Tectra.name).toBe('tectra-blue-ink');
    expect(Tectra.palettes.surface).toBe(SURFACE_PALETTES.ink);
  });

  it('moves the light primary to step 700 when white text on 600 is too weak', () => {
    expect(createTectraPreset({ primary: 'yellow' }).light.primary.base).toBe(ACCENT_PALETTES.yellow[700]);
  });

  it('builds noir from the surface', () => {
    const preset = createTectraPreset({ primary: 'noir', surface: 'zinc' });
    expect(preset.light.primary.base).toBe(SURFACE_PALETTES.zinc[950]);
    expect(preset.dark.primary.base).toBe(SURFACE_PALETTES.zinc[50]);
  });

  it('applies the style overrides', () => {
    expect(createTectraPreset({ style: 'edge' }).name).toBe('edge-blue-ink');
  });
});
