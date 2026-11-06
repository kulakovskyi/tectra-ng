import { lightDark, tokenRef } from '../../components/token-helpers';
import { TectraComponentTokens } from '../../components/component-tokens';
import { TectraDeepPartial } from '../../types/deep-partial.type';

const ring = `0 0 1px 4px ${lightDark(tokenRef('surface-200'), tokenRef('surface-700'))}`;
const noOutline = { width: '0', style: 'none', color: 'transparent' };
const sm = { padding: '5.25px 7px' };
const lg = { padding: '12.25px 15.75px' };

export const paperDataTokens: TectraDeepPartial<TectraComponentTokens> = {
  paginator: {
    root: { padding: '7px 12.25px', borderRadius: tokenRef('radius-sm') },
    navButton: { focusRing: { ...noOutline, offset: '0', shadow: ring } },
  },
  table: {
    headerCell: { focusRing: { ...noOutline, shadow: ring }, sm, lg },
    row: { focusRing: { ...noOutline, shadow: ring } },
    bodyCell: { sm, lg },
    rowToggleButton: { focusRing: { ...noOutline, offset: '0', shadow: ring } },
  },
  tree: {
    root: { indent: '24.5px' },
    node: {
      padding: '7px 8.75px',
      borderRadius: tokenRef('radius-xs'),
      gap: '7px',
      focusRing: { ...noOutline, shadow: ring },
    },
    nodeToggleButton: { size: '24.5px' },
    filter: { margin: '0 0 8.75px 0' },
  },
};
