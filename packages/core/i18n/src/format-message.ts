const PLURAL_START = /\{(\w+),\s*plural,\s*/g;
const FORM_KEY = /^\s*(=\d+|\w+)\s*\{/;

/** Values for the `{name}` placeholders of a message. */
export type TxMessageParams = Record<string, string | number>;

/** Fills `{name}` placeholders and ICU `{count, plural, one {…} other {…}}` forms of a message, with `#` as the count. */
export function formatMessage(template: string, params: TxMessageParams = {}, intl = 'en-US'): string {
  return replacePlurals(template, params, new Intl.PluralRules(intl)).replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match));
}

function replacePlurals(template: string, params: TxMessageParams, rules: Intl.PluralRules): string {
  let result = '';
  let index = 0;
  PLURAL_START.lastIndex = 0;
  let match = PLURAL_START.exec(template);
  while (match) {
    result += template.slice(index, match.index);
    const forms: Record<string, string> = {};
    let cursor = PLURAL_START.lastIndex;
    let key = FORM_KEY.exec(template.slice(cursor));
    while (key) {
      cursor += key[0].length;
      const start = cursor;
      let depth = 1;
      while (cursor < template.length && depth > 0) {
        depth += template[cursor] === '{' ? 1 : template[cursor] === '}' ? -1 : 0;
        cursor++;
      }
      forms[key[1]] = template.slice(start, cursor - 1);
      key = FORM_KEY.exec(template.slice(cursor));
    }
    const count = Number(params[match[1]] ?? 0);
    result += (forms[`=${count}`] ?? forms[rules.select(count)] ?? forms['other'] ?? '').replace(/#/g, String(count));
    const end = template.indexOf('}', cursor);
    index = end === -1 ? template.length : end + 1;
    PLURAL_START.lastIndex = index;
    match = PLURAL_START.exec(template);
  }
  return result + template.slice(index);
}
