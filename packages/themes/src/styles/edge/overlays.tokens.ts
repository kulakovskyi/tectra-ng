import { TectraComponentTokens } from '../../components/component-tokens';
import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

const radius = tokenRef('radius-xs');
const listPadding = '1.75px 0';

export const edgeOverlaysTokens: TectraDeepPartial<TectraComponentTokens> = {
  tooltip: {
    root: {
      background: lightDark(tokenRef('surface-900'), tokenRef('surface-0')),
      color: lightDark(tokenRef('surface-0'), tokenRef('surface-900')),
      borderRadius: radius,
    },
  },
  popover: {
    root: { borderRadius: radius },
  },
  toast: {
    item: {
      background: tokenRef('surface-card'),
      blur: '0px',
      borderRadius: radius,
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },
  },
  dialog: {
    root: { borderColor: tokenRef('surface-overlay-border'), borderRadius: radius },
    title: { fontWeight: tokenRef('font-weight-bold') },
  },
  confirm: {
    message: { color: tokenRef('text-primary') },
    popup: { borderRadius: radius },
  },
  menu: {
    root: { borderRadius: radius, padding: listPadding, gap: '0' },
    item: {
      borderRadius: '0',
      focusBackground: tokenRef('primary-base'),
      focusColor: tokenRef('primary-contrast'),
      activeBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    },
    icon: { color: tokenRef('text-muted'), focusColor: tokenRef('primary-contrast') },
    groupLabel: { color: tokenRef('text-primary'), fontWeight: tokenRef('font-weight-bold') },
    popup: { borderColor: tokenRef('surface-border'), padding: listPadding, gap: '0', itemBorderRadius: '0' },
    context: { padding: listPadding, itemBorderRadius: '0' },
  },
};
