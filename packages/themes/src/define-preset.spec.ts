import { ACCENT_PALETTES } from '@tectra/tokens';
import { deepMerge, definePreset } from './define-preset';
import { InkPreset, createInkPreset } from './presets/ink/ink.preset';

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
    const preset = definePreset(InkPreset, { components: { button: { root: { borderRadius: '0' } } } });
    expect(preset.components.button.root.borderRadius).toBe('0');
    expect(preset.components.button.root.paddingX).toBe(InkPreset.components.button.root.paddingX);
    expect(preset.light).toBe(InkPreset.light);
  });
});

describe('createInkPreset', () => {
  it('builds primary from the accent palette', () => {
    const preset = createInkPreset('teal');
    expect(preset.name).toBe('ink-teal');
    expect(preset.light.primary.base).toBe(ACCENT_PALETTES.teal[600]);
    expect(preset.dark.primary.base).toBe(ACCENT_PALETTES.teal[400]);
  });

  it('defaults to blue', () => {
    expect(InkPreset.name).toBe('ink-blue');
  });
});
