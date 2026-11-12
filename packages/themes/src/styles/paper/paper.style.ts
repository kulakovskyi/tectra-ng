import { mergeTokens } from '../../components/token-helpers';
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

/* @__NO_SIDE_EFFECTS__ */
function joinStyleCss(...parts: string[]): string {
  return parts.filter(Boolean).join('\n');
}

export const paperStyle: TectraStyle = {
  name: 'paper',
  label: 'Paper',
  light: paperLight,
  dark: paperDark,
  components: mergeTokens(paperFormsTokens, paperControlsTokens, paperDisplayTokens, paperOverlaysTokens, paperDataTokens),
  css: joinStyleCss(paperFormsCss, paperControlsCss, paperDisplayCss, paperOverlaysCss, paperDataCss),
};
