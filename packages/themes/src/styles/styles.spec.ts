import { ACCENT_PALETTES, SURFACE_PALETTES } from '@tectra-ng/tokens';
import { primaryBaseStep } from '../semantic/contrast';
import { TectraPalettes } from '../types/preset.interface';
import { TECTRA_STYLES } from './styles';

const accents = Object.values(ACCENT_PALETTES);
const accentWithBase = (step: 600 | 700) => accents.find((accent) => primaryBaseStep(accent) === step);

function palettes(accent = ACCENT_PALETTES.blue): TectraPalettes {
  return { accent, surface: SURFACE_PALETTES.ink };
}

describe('TECTRA_STYLES', () => {
  it('lists every style under its own name', () => {
    expect(Object.keys(TECTRA_STYLES)).toEqual(['tectra', 'soft', 'edge', 'paper']);
    for (const [name, style] of Object.entries(TECTRA_STYLES)) {
      expect(style.name).toBe(name);
      expect(style.label).toBeTruthy();
    }
  });

  it('gives semantic overrides in light and dark', () => {
    for (const style of Object.values(TECTRA_STYLES)) {
      for (const scheme of [style.light, style.dark]) {
        if (scheme) {
          expect(Object.keys(scheme(palettes())).length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('paper style', () => {
  it('tints the highlight with the primary base step', () => {
    const accent = ACCENT_PALETTES.blue;
    const light = TECTRA_STYLES.paper.light?.(palettes(accent));
    expect(light?.highlight?.background).toBe(`color-mix(in srgb, ${accent[primaryBaseStep(accent)]}, transparent 88%)`);
    expect(TECTRA_STYLES.paper.dark?.(palettes()).surface?.border).toBe(SURFACE_PALETTES.ink[700]);
  });
});

describe('edge style', () => {
  it.each([600, 700] as const)('focuses the highlight one step past a base of %i', (step) => {
    const accent = accentWithBase(step);
    expect(accent).toBeDefined();
    if (accent) {
      const light = TECTRA_STYLES.edge.light?.(palettes(accent));
      expect(light?.highlight?.background).toBe(accent[step]);
      expect(light?.highlight?.focusBackground).toBe(accent[step === 600 ? 700 : 800]);
    }
  });
});
