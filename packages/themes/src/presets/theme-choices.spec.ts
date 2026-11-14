import { ACCENT_PALETTES, SURFACE_PALETTES } from '@tectra-ng/tokens';
import { softStyle } from '../styles/soft/soft.style';
import { createTectraPreset } from './tectra.preset';
import { isTectraPrimary, isTectraSurface, tectraPrimaryChoices, tectraSurfaceChoices } from './theme-choices';

describe('theme choices', () => {
  it('lists the primary colors in picker order with their swatches', () => {
    const choices = tectraPrimaryChoices();
    expect(choices[0]).toEqual({ value: 'noir', label: 'Noir', color: 'var(--tx-text-primary)' });
    expect(choices.find((choice) => choice.value === 'teal')).toEqual({ value: 'teal', label: 'Teal', color: ACCENT_PALETTES.teal[500] });
  });

  it('lists the surface palettes with their middle step', () => {
    const choices = tectraSurfaceChoices();
    expect(choices.map((choice) => choice.value)).toEqual(Object.keys(SURFACE_PALETTES));
    expect(choices[0]).toEqual({ value: 'ink', label: 'Ink', color: SURFACE_PALETTES.ink[500] });
  });

  it('tells known primary and surface names apart', () => {
    expect(isTectraPrimary('teal')).toBe(true);
    expect(isTectraPrimary('noir')).toBe(true);
    expect(isTectraPrimary('plaid')).toBe(false);
    expect(isTectraPrimary(3)).toBe(false);
    expect(isTectraSurface('slate')).toBe(true);
    expect(isTectraSurface('toString')).toBe(false);
    expect(isTectraSurface(null)).toBe(false);
  });

  it('records what a preset was built from', () => {
    expect(createTectraPreset({ style: softStyle, primary: 'teal', surface: 'zinc' }).source).toEqual({ style: softStyle, primary: 'teal', surface: 'zinc' });
  });
});
