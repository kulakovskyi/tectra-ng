import { TectraComponentTokens } from '../../components/component-tokens';
import { tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

export const softOverlaysTokens: TectraDeepPartial<TectraComponentTokens> = {
  tooltip: { root: { borderRadius: tokenRef('radius-xl') } },
  popover: { root: { borderRadius: '18px' } },
  dialog: { root: { borderRadius: '26px' } },
  confirm: { root: { borderRadius: '26px' }, popup: { borderRadius: '18px' } },
  menu: {
    root: { borderRadius: tokenRef('radius-xl'), padding: '6px' },
    item: { padding: '8px 12px', borderRadius: tokenRef('radius-lg') },
  },
};
