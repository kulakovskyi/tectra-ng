import { InkPreset } from './presets/ink/ink.preset';
import { presetToCss, toCssVariables, toStyleObject } from './preset-to-css';

describe('toCssVariables', () => {
  it('flattens nested keys into kebab-case variables', () => {
    expect(toCssVariables({ focusRing: { color: 'red' } })).toEqual([{ name: '--tx-focus-ring-color', value: 'red' }]);
  });

  it('skips the root key', () => {
    expect(toCssVariables({ root: { paddingX: '4px' } }, '--tx-button')).toEqual([{ name: '--tx-button-padding-x', value: '4px' }]);
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
  const css = presetToCss(InkPreset);

  it('writes light variables on :root', () => {
    expect(css).toContain(`:root { `);
    expect(css).toContain(`--tx-primary-base: ${InkPreset.light.primary.base};`);
  });

  it('writes dark variables under the dark attribute', () => {
    expect(css).toContain(`:root[data-tx-theme="dark"] { `);
    expect(css).toContain(`--tx-primary-base: ${InkPreset.dark.primary.base};`);
  });

  it('writes palettes and component tokens', () => {
    expect(css).toContain('--tx-primary-600:');
    expect(css).toContain('--tx-red-500:');
    expect(css).toContain('--tx-button-primary-background:');
    expect(css).toContain('--tx-toggle-button-checked-color:');
  });
});
