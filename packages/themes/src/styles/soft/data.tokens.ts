import { TectraComponentTokens } from '../../components/component-tokens';
import { tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';
import { softFocusShadow } from './soft.shared';

export const softDataTokens: TectraDeepPartial<TectraComponentTokens> = {
  chart: {
    pie: { segmentRadius: '8px' },
    legend: { borderRadius: tokenRef('radius-full'), paddingX: '10px', statRadius: tokenRef('radius-xl') },
    tooltip: { borderRadius: tokenRef('radius-xl'), padding: '10px 14px' },
    bar: { radius: '9px' },
    line: { strokeWidth: '2.5' },
  },
  paginator: {
    root: { borderRadius: tokenRef('radius-full') },
    navButton: { borderRadius: tokenRef('radius-full'), focusRing: { width: '0', shadow: softFocusShadow() } },
  },
  tree: { node: { borderRadius: tokenRef('radius-lg') } },
  dataView: { root: { borderRadius: '22px' } },
};
