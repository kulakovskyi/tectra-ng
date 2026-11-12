import { joinCss, tokenRef } from './token-helpers';

export const appFooterTokens = {
  root: {
    borderColor: tokenRef('surface-border'),
    color: tokenRef('text-muted'),
    fontSize: '10.5px',
    lineHeight: '17.5px',
    gap: '8.75px',
    wideGap: '21px',
  },
  page: {
    maxWidth: '1064px',
    padding: '21px 17.5px',
  },
  app: {
    marginTop: '42px',
    padding: '17.5px 0 3.5px',
  },
  console: {
    padding: '14px 21px',
    mobilePadding: '14px',
  },
  link: {
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    paddingX: '10.5px',
    rowGap: '3.5px',
    separatorHeight: '10.5px',
    separatorColor: tokenRef('surface-border'),
    borderRadius: tokenRef('radius-xs'),
    focusRingShadow: joinCss('0 0 0 2px ', tokenRef('surface-card'), ', 0 0 0 4px ', tokenRef('focus-ring-color')),
    transitionDuration: '150ms',
  },
};

export type TectraAppFooterTokens = typeof appFooterTokens;
