import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraComponentTokens } from '../../components/component-tokens';
import { TectraDeepPartial } from '../../types/deep-partial.type';

const radius = tokenRef('radius-xs');

export const edgeDataTokens: TectraDeepPartial<TectraComponentTokens> = {
  paginator: {
    root: { borderRadius: radius },
    navButton: { borderRadius: radius },
  },
  table: {
    root: { borderColor: lightDark(tokenRef('surface-300'), tokenRef('surface-600')) },
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
