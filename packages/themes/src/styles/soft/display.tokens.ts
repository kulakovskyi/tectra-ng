import { TectraComponentTokens } from '../../components/component-tokens';
import { tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';
import { softCardShadow, softFill } from './soft.shared';

export const softDisplayTokens: TectraDeepPartial<TectraComponentTokens> = {
  card: { root: { borderRadius: '22px', shadow: softCardShadow } },
  panel: { root: { borderRadius: '22px' } },
  fieldset: { root: { borderRadius: '18px', legendBorderRadius: tokenRef('radius-full') } },
  tag: { root: { borderRadius: tokenRef('radius-full'), paddingX: '9px' }, sm: { paddingX: '7px' }, lg: { paddingX: '12px' } },
  chip: { root: { background: softFill } },
  message: { root: { borderRadius: '16px', borderColor: 'transparent', borderTint: '28%' } },
  avatar: { root: { squareBorderRadius: tokenRef('radius-xl') } },
  skeleton: { root: { borderRadius: tokenRef('radius-lg') } },
};
