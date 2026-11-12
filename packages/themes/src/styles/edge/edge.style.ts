import { mergeTokens } from '../../components/token-helpers';
import { TectraStyle } from '../../types/style.interface';
import { edgeDark, edgeLight } from './edge.semantic';
import { edgeFormsTokens } from './forms.tokens';
import { edgeControlsTokens } from './controls.tokens';
import { edgeDisplayTokens } from './display.tokens';
import { edgeOverlaysTokens } from './overlays.tokens';
import { edgeDataTokens } from './data.tokens';

export const edgeStyle: TectraStyle = {
  name: 'edge',
  label: 'Edge',
  light: edgeLight,
  dark: edgeDark,
  components: mergeTokens(edgeFormsTokens, edgeControlsTokens, edgeDisplayTokens, edgeOverlaysTokens, edgeDataTokens),
};
