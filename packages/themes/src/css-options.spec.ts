import { ACCENT_PALETTES, SEVERITY_PALETTES } from '@tectra-ng/tokens';
import { Tectra } from './presets/tectra.preset';
import { componentTokensCss, presetBaseCss, presetToCss, pxToRem } from './preset-to-css';

describe('pxToRem', () => {
  it('writes px sizes as rem from a root of 16', () => {
    expect(pxToRem('16px')).toBe('1rem');
    expect(pxToRem('6px 10px')).toBe('0.375rem 0.625rem');
    expect(pxToRem('calc(100% - 12px)')).toBe('calc(100% - 0.75rem)');
    expect(pxToRem('-8px')).toBe('-0.5rem');
    expect(pxToRem('0 4px 6px -2px rgba(0, 0, 0, 0.1)')).toBe('0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.1)');
  });

  it('counts from another root size and rounds to four places', () => {
    expect(pxToRem('14px', 14)).toBe('1rem');
    expect(pxToRem('13px', 14)).toBe('0.9286rem');
  });

  it('keeps hairlines, zero and other units', () => {
    expect(pxToRem('1px solid var(--tx-surface-border)')).toBe('1px solid var(--tx-surface-border)');
    expect(pxToRem('0.5px')).toBe('0.5px');
    expect(pxToRem('0px')).toBe('0px');
    expect(pxToRem('2em 50% 9999px')).toBe('2em 50% 624.9375rem');
    expect(pxToRem('var(--tx-gap-12px)')).toBe('var(--tx-gap-12px)');
  });

  it('reads decimal sizes and stays fast on long runs of digits', () => {
    expect(pxToRem('12.5px .5px 24.px')).toBe('0.7813rem .5px 24.px');
    const digits = '0'.repeat(50000);
    const start = performance.now();
    expect(pxToRem(`${digits}.${digits}x`)).toBe(`${digits}.${digits}x`);
    expect(pxToRem(`${digits}px`)).toBe(`${digits}px`);
    expect(performance.now() - start).toBeLessThan(500);
  });
});

describe('preset css options', () => {
  it('writes no extra palettes and keeps px by default', () => {
    const base = presetBaseCss(Tectra);
    expect(base).not.toContain('--tx-teal-500:');
    expect(base).toContain('--tx-radius-md: 7px;');
    expect(presetBaseCss(Tectra, {})).toBe(base);
  });

  it('writes the chosen accent palettes as --tx-<palette>-<step>', () => {
    const base = presetBaseCss(Tectra, { palettes: ['teal', 'rose'] });
    expect(base).toContain(`--tx-teal-500: ${ACCENT_PALETTES.teal[500]};`);
    expect(base).toContain(`--tx-teal-950: ${ACCENT_PALETTES.teal[950]};`);
    expect(base).toContain(`--tx-rose-50: ${ACCENT_PALETTES.rose[50]};`);
    expect(base).not.toContain('--tx-cyan-500:');
    expect(presetToCss(Tectra, { palettes: ['indigo'] })).toContain(`--tx-indigo-600: ${ACCENT_PALETTES.indigo[600]};`);
  });

  it('keeps the severity palettes for names they already have and skips unknown names', () => {
    const base = presetBaseCss(Tectra, { palettes: ['green', 'nope' as 'teal'] });
    expect(base).toContain(`--tx-green-500: ${SEVERITY_PALETTES.green[500]};`);
    expect(base.match(/--tx-green-500:/g)).toHaveLength(1);
    expect(base).not.toContain('--tx-nope-');
  });

  it('writes sizes as rem in the base, the component groups and the full css', () => {
    const base = presetBaseCss(Tectra, { units: 'rem' });
    expect(base).toContain('--tx-radius-md: 0.4375rem;');
    expect(base).toContain('--tx-space-4: 1rem;');
    expect(base).toContain('--tx-font-size-md: 0.875rem;');
    expect(componentTokensCss('chip', { root: { gap: '6px', border: '1px solid red' } }, { units: 'rem' })).toBe(':root { --tx-chip-gap: 0.375rem; --tx-chip-border: 1px solid red; }');
    const full = presetToCss(Tectra, { units: 'rem', rootFontSize: 14 });
    expect(full).toContain('--tx-font-size-md: 1rem;');
    expect(full).toContain('--tx-button-padding-x: 0.8571rem;');
  });

  it('keeps px when units is px', () => {
    expect(componentTokensCss('chip', { root: { gap: '6px' } }, { units: 'px' })).toBe(':root { --tx-chip-gap: 6px; }');
  });
});
