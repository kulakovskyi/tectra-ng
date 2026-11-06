import { TectraStyle } from '../../types/style.interface';
import { paperDark, paperLight } from './paper.semantic';
import { paperFormsTokens } from './forms.tokens';
import { paperControlsTokens } from './controls.tokens';
import { paperDisplayTokens } from './display.tokens';
import { paperOverlaysTokens } from './overlays.tokens';
import { paperDataTokens } from './data.tokens';
import { paperFormsCss } from './forms.css';
import { paperControlsCss } from './controls.css';
import { paperDisplayCss } from './display.css';
import { paperOverlaysCss } from './overlays.css';
import { paperDataCss } from './data.css';

export const paperStyle: TectraStyle = {
  label: 'Paper',
  light: paperLight,
  dark: paperDark,
  components: {
    ...paperFormsTokens,
    ...paperControlsTokens,
    ...paperDisplayTokens,
    ...paperOverlaysTokens,
    ...paperDataTokens,
  },
  css: [paperFormsCss, paperControlsCss, paperDisplayCss, paperOverlaysCss, paperDataCss].filter(Boolean).join('\n'),
};
