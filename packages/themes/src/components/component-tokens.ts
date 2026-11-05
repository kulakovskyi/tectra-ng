import { badgeTokens } from './badge.tokens';
import { buttonTokens } from './button.tokens';
import { iconTokens } from './icon.tokens';
import { rippleTokens } from './ripple.tokens';
import { toggleButtonTokens } from './toggle-button.tokens';

export const COMPONENT_TOKENS = {
  icon: iconTokens,
  ripple: rippleTokens,
  button: buttonTokens,
  badge: badgeTokens,
  toggleButton: toggleButtonTokens,
};

export type TectraComponentTokens = typeof COMPONENT_TOKENS;
