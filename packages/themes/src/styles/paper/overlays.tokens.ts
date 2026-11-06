import { TectraComponentTokens } from '../../components/component-tokens';
import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraDeepPartial } from '../../types/deep-partial.type';

const radius = tokenRef('radius-sm');
const elevatedShadow = '0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12)';
const popoverPadding = '12.25px';
const modalPadding = '17.5px';
const itemPadding = '8.75px 12.25px';
const iconColor = lightDark(tokenRef('surface-600'), tokenRef('surface-400'));

export const paperOverlaysTokens: TectraDeepPartial<TectraComponentTokens> = {
  tooltip: {
    root: {
      background: tokenRef('surface-600'),
      color: tokenRef('surface-0'),
      maxWidth: '154px',
      padding: '7px 8.75px',
      borderRadius: radius,
      fontSize: '8.75px',
      shadow: elevatedShadow,
    },
  },
  popover: {
    root: { borderRadius: radius, shadow: elevatedShadow },
    header: { padding: `${popoverPadding} ${popoverPadding} 0` },
    content: { padding: popoverPadding },
    footer: { padding: `0 ${popoverPadding} ${popoverPadding}` },
  },
  toast: {
    root: { width: 'min(306.25px, calc(100vw - 28px))' },
    item: {
      ringColor: 'transparent',
      shadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
      borderRadius: radius,
      paddingY: popoverPadding,
      paddingStart: popoverPadding,
      paddingEnd: popoverPadding,
      loadingPaddingEnd: popoverPadding,
    },
    closeButton: { size: '24.5px' },
    focusRing: { shadow: `0 0 1px 4px ${lightDark(tokenRef('surface-200'), tokenRef('surface-700'))}` },
  },
  dialog: {
    root: { borderColor: tokenRef('surface-overlay-border'), borderRadius: radius, shadow: elevatedShadow },
    header: { padding: modalPadding },
    content: { padding: `0 ${modalPadding}`, lastPaddingBottom: modalPadding },
    footer: { padding: modalPadding },
    drawer: {
      headerPadding: modalPadding,
      titleFontSize: '17.5px',
      contentPadding: modalPadding,
      footerPadding: modalPadding,
    },
  },
  confirm: {
    message: { color: tokenRef('text-primary') },
    popup: {
      borderRadius: radius,
      shadow: elevatedShadow,
      padding: popoverPadding,
      gap: popoverPadding,
      footerGap: '7px',
    },
  },
  menu: {
    root: {
      borderRadius: radius,
      shadow: '0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12)',
      padding: '7px 0',
      gap: '0',
    },
    item: {
      padding: itemPadding,
      borderRadius: '0',
      activeBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    },
    icon: { color: iconColor, focusColor: iconColor },
    groupLabel: { padding: itemPadding, color: tokenRef('text-primary'), fontWeight: tokenRef('font-weight-bold') },
    popup: { borderColor: 'transparent', padding: '7px 0', gap: '0', itemPadding, itemBorderRadius: '0' },
    context: { borderColor: 'transparent', padding: '7px 0', itemPadding, itemBorderRadius: '0' },
  },
};
