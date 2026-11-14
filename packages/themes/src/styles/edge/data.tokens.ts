import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraComponentTokens } from '../../components/component-tokens';
import { TectraDeepPartial } from '../../types/deep-partial.type';

const radius = tokenRef('radius-xs');

export const edgeDataTokens: TectraDeepPartial<TectraComponentTokens> = {
  chart: {
    pie: { segmentRadius: '1px' },
    bar: { radius: radius },
    legend: { borderRadius: radius, markerRadius: '1px', pillRadius: radius, statRadius: radius },
    tooltip: { borderRadius: radius },
    line: { strokeWidth: '2' },
  },
  paginator: {
    root: { borderRadius: radius },
    navButton: { borderRadius: radius },
  },
  table: {
    root: { borderColor: lightDark(tokenRef('surface-300'), tokenRef('surface-600')) },
    row: { selectedColor: tokenRef('highlight-color') },
    headerCell: { fontWeight: tokenRef('font-weight-bold') },
    footerCell: { fontWeight: tokenRef('font-weight-bold') },
  },
  tree: {
    node: {
      borderRadius: radius,
      focusRing: { offset: '-2px' },
    },
  },
};
