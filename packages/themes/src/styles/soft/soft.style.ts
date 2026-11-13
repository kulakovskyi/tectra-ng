import { mergeTokens } from '../../components/token-helpers';
import { TectraStyle } from '../../types/style.interface';
import { softDark, softLight } from './soft.semantic';
import { softFormsTokens } from './forms.tokens';
import { softControlsTokens } from './controls.tokens';
import { softDisplayTokens } from './display.tokens';
import { softOverlaysTokens } from './overlays.tokens';
import { softDataTokens } from './data.tokens';

/**
 * Soft look: pill buttons, tags and segments, filled borderless fields, tonal secondary buttons, large radii
 * on cards and overlays, glow focus.
 */
export const softStyle: TectraStyle = {
  name: 'soft',
  label: 'Soft',
  light: softLight,
  dark: softDark,
  components: mergeTokens(softFormsTokens, softControlsTokens, softDisplayTokens, softOverlaysTokens, softDataTokens),
};
