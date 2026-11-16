import { COMPONENT_TOKENS } from './components/component-tokens';
import { Edge, Paper, Tectra } from './presets/tectra.preset';
import { componentTokensCss, presetBaseCss, presetToCss, toCssVariables, toStyleObject } from './preset-to-css';

describe('toCssVariables', () => {
  it('flattens nested keys into kebab-case variables', () => {
    expect(toCssVariables({ focusRing: { color: 'red' } })).toEqual([{ name: '--tx-focus-ring-color', value: 'red' }]);
  });

  it('skips the root key', () => {
    expect(toCssVariables({ root: { paddingX: '4px' } }, '--tx-button')).toEqual([{ name: '--tx-button-padding-x', value: '4px' }]);
  });

  it('writes a null value as text', () => {
    expect(toCssVariables({ shadow: null })).toEqual([{ name: '--tx-shadow', value: 'null' }]);
  });
});

describe('toStyleObject', () => {
  it('returns an empty object without tokens', () => {
    expect(toStyleObject(undefined, '--tx-button')).toEqual({});
  });

  it('maps tokens to a style object', () => {
    expect(toStyleObject({ root: { primary: { background: 'teal' } } }, '--tx-button')).toEqual({ '--tx-button-primary-background': 'teal' });
  });
});

describe('presetToCss', () => {
  const css = presetToCss(Tectra);

  it('writes light variables on :root', () => {
    expect(css).toContain(`:root { `);
    expect(css).toContain(`--tx-primary-base: ${Tectra.light.primary.base};`);
  });

  it('writes dark variables under the dark attribute', () => {
    expect(css).toContain(`:root[data-tx-theme="dark"] { `);
    expect(css).toContain(`--tx-primary-base: ${Tectra.dark.primary.base};`);
  });

  it('writes palettes and component tokens', () => {
    expect(css).toContain('--tx-primary-600:');
    expect(css).toContain('--tx-red-500:');
    expect(css).toContain('--tx-button-primary-background:');
    expect(css).toContain('--tx-toggle-button-checked-color:');
  });

  it('adds the style css only when the preset has it', () => {
    const withCss = presetToCss({ ...Tectra, css: '.tx-button { gap: 0; }' });
    expect(withCss).toContain('.tx-button { gap: 0; }');
    expect(presetToCss({ ...Tectra, css: undefined }).split('\n')).toHaveLength(2);
  });
});

describe('presets without component tokens', () => {
  it('keep only the overrides of their style', () => {
    expect(Tectra.components).toEqual({});
    expect(Object.keys(Paper.components)).toContain('button');
    expect(Paper.components.button).not.toEqual(COMPONENT_TOKENS.button);
  });

  it('write the base without components and every component with presetToCss', () => {
    const base = presetBaseCss(Paper);
    expect(base).toContain('--tx-primary-base:');
    expect(base).not.toContain('--tx-button-');
    const full = presetToCss(Paper);
    expect(full).toContain(`--tx-button-padding-x: ${Paper.components.button?.root?.paddingX};`);
    expect(full).toContain('--tx-toggle-button-checked-color:');
  });

  it('write one group as a :root block', () => {
    expect(componentTokensCss('toggleButton', { root: { gap: '4px' } })).toBe(':root { --tx-toggle-button-gap: 4px; }');
  });
});

describe('content surface tokens', () => {
  it('give every page one radius and one shadow for content surfaces', () => {
    const base = presetBaseCss(Tectra);
    expect(base).toContain('--tx-content-radius: var(--tx-radius-lg);');
    expect(base).toMatch(/--tx-content-shadow: 0 1px 2px color-mix\(in srgb, #[0-9a-f]{6}, transparent 95%\);/);
  });

  it('frame cards, panels, stat tiles, data views and filters panels with them', () => {
    for (const group of [COMPONENT_TOKENS.card, COMPONENT_TOKENS.panel, COMPONENT_TOKENS.statTile, COMPONENT_TOKENS.dataView, COMPONENT_TOKENS.filtersPanel]) {
      expect(group.root).toMatchObject({ borderRadius: 'var(--tx-content-radius)', shadow: 'var(--tx-content-shadow)' });
    }
  });

  it('change together with the style', () => {
    for (const preset of [Edge, Paper]) {
      for (const scheme of [preset.light, preset.dark]) {
        expect(scheme.content.radius).toBe('var(--tx-radius-sm)');
        expect(scheme.content.shadow).not.toBe(Tectra.light.content.shadow);
      }
      expect(preset.components.card?.root?.borderRadius).toBeUndefined();
      expect(preset.components.panel?.root?.borderRadius).toBeUndefined();
    }
  });
});
