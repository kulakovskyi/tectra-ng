import { TectraComponentTokens } from '../../components/component-tokens';
import { tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';
import { softFocusShadow } from './soft.shared';

export const softDataTokens: TectraDeepPartial<TectraComponentTokens> = {
  paginator: {
    root: { borderRadius: tokenRef('radius-full') },
    navButton: { borderRadius: tokenRef('radius-full'), focusRing: { width: '0', shadow: softFocusShadow() } },
  },
  tree: { node: { borderRadius: tokenRef('radius-lg') } },
  dataView: { root: { borderRadius: '22px' } },
};
