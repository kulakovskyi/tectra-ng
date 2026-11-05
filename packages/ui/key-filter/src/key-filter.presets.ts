import { TxKeyFilterPreset, TxKeyFilterRule } from './key-filter.types';

export const TX_KEY_FILTER_PRESETS: Record<TxKeyFilterPreset, TxKeyFilterRule> = {
  pint: { char: /\d/ },
  int: { char: /[\d-]/ },
  pnum: { char: /[\d.]/ },
  num: { char: /[\d.-]/ },
  money: { char: /[\d.\s,]/ },
  hex: { char: /[0-9a-f]/i },
  email: { char: /[a-z0-9_.\-@]/i },
  alpha: { char: /[a-z_]/i },
  alphanum: { char: /[a-z0-9_]/i },
  latin: { char: /[a-z]/i },
  positive: { char: /[\d.,]/, value: /^\d*([.,]\d*)?$/ },
  nospace: { char: /\S/ },
};

export function txKeyFilterRule(filter: TxKeyFilterPreset | RegExp, extra = ''): TxKeyFilterRule {
  const rule = filter instanceof RegExp ? { char: filter } : TX_KEY_FILTER_PRESETS[filter];
  if (!extra) {
    return rule;
  }
  const escaped = extra.replace(/[\\\]^-]/g, '\\$&');
  return { ...rule, char: new RegExp(`(?:${rule.char.source})|[${escaped}]`, rule.char.flags.replace('g', '')) };
}

export function txKeyFilterAccepts(rule: TxKeyFilterRule, text: string): boolean {
  return [...text].every((character) => rule.char.test(character)) && (!rule.value || rule.value.test(text));
}
