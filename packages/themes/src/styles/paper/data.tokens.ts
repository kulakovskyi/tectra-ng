import { joinCss, lightDark, mergeTokens, tokenRef } from '../../components/token-helpers';
import { TectraComponentTokens } from '../../components/component-tokens';
import { TectraDeepPartial } from '../../types/deep-partial.type';

const ring = joinCss('0 0 1px 4px ', lightDark(tokenRef('surface-200'), tokenRef('surface-700')));
const noOutline = { width: '0', style: 'none', color: 'transparent' };
const sm = { padding: '5.25px 7px' };
const lg = { padding: '12.25px 15.75px' };

export const paperDataTokens: TectraDeepPartial<TectraComponentTokens> = {
  chart: {
    pie: { segmentRadius: '2px' },
    bar: { radius: tokenRef('radius-xs') },
    legend: { borderRadius: tokenRef('radius-sm'), pillRadius: tokenRef('radius-sm'), statRadius: tokenRef('radius-sm') },
    tooltip: { borderRadius: tokenRef('radius-sm'), shadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)' },
  },
  paginator: {
    root: { padding: '7px 12.25px', borderRadius: tokenRef('radius-sm') },
    navButton: { focusRing: mergeTokens(noOutline, { offset: '0', shadow: ring }) },
  },
  table: {
    headerCell: { focusRing: mergeTokens(noOutline, { shadow: ring }), sm, lg },
    row: { focusRing: mergeTokens(noOutline, { shadow: ring }) },
    bodyCell: { sm, lg },
    rowToggleButton: { focusRing: mergeTokens(noOutline, { offset: '0', shadow: ring }) },
  },
  tree: {
    root: { indent: '24.5px' },
    node: {
      padding: '7px 8.75px',
      borderRadius: tokenRef('radius-xs'),
      gap: '7px',
      focusRing: mergeTokens(noOutline, { shadow: ring }),
    },
    nodeToggleButton: { size: '24.5px' },
    filter: { margin: '0 0 8.75px 0' },
  },
};
