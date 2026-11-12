import { COMPONENT_TOKENS } from './components/component-tokens';
import { Soft, Tectra } from './presets/tectra.preset';
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
    expect(Object.keys(Soft.components)).toContain('button');
    expect(Soft.components.button).not.toEqual(COMPONENT_TOKENS.button);
  });

  it('write the base without components and every component with presetToCss', () => {
    const base = presetBaseCss(Soft);
    expect(base).toContain('--tx-primary-base:');
    expect(base).not.toContain('--tx-button-');
    const full = presetToCss(Soft);
    expect(full).toContain(`--tx-button-padding-x: ${Soft.components.button?.root?.paddingX};`);
    expect(full).toContain('--tx-toggle-button-checked-color:');
  });

  it('write one group as a :root block', () => {
    expect(componentTokensCss('toggleButton', { root: { gap: '4px' } })).toBe(':root { --tx-toggle-button-gap: 4px; }');
  });
});
