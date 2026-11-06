import { TectraStyle } from '../../types/style.interface';
import { softDark, softLight } from './soft.semantic';
import { softFormsTokens } from './forms.tokens';
import { softControlsTokens } from './controls.tokens';
import { softDisplayTokens } from './display.tokens';
import { softOverlaysTokens } from './overlays.tokens';
import { softDataTokens } from './data.tokens';

export const softStyle: TectraStyle = {
  label: 'Soft',
  light: softLight,
  dark: softDark,
  components: {
    ...softFormsTokens,
    ...softControlsTokens,
    ...softDisplayTokens,
    ...softOverlaysTokens,
    ...softDataTokens,
  },
};
