/** ISO 3166-1 alpha-2 codes of the countries the kit knows, plus `XK` for Kosovo. */
export const TX_COUNTRY_CODES: readonly string[] = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL ' +
  'CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT ' +
  'GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY ' +
  'MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN ' +
  'PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT ' +
  'TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'
).split(' ');

const COUNTRY_CODE = /^[A-Z]{2}$/;
const nameCache = new Map<string, Intl.DisplayNames>();

/**
 * Tells whether the text is two letters, in any case, as a country code looks; it does not check that the country exists.
 */
export function isCountryCode(code: string | null | undefined): boolean {
  return !!code && COUNTRY_CODE.test(code.trim().toUpperCase());
}

/**
 * Name of the country in the given locale, such as `Poland` for `PL`; text that is not a country code comes back unchanged.
 */
export function countryName(code: string, locale: string): string {
  const upper = code.trim().toUpperCase();
  if (!isCountryCode(upper)) {
    return code;
  }
  let names = nameCache.get(locale);
  if (!names) {
    names = new Intl.DisplayNames([locale], { type: 'region', fallback: 'code' });
    nameCache.set(locale, names);
  }
  return names.of(upper) ?? upper;
}

/** Emoji flag of the country code; an empty string when the code is not valid. */
export function countryEmoji(code: string): string {
  const upper = code.trim().toUpperCase();
  return isCountryCode(upper) ? String.fromCodePoint(...[...upper].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65)) : '';
}
