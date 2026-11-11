import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TxCssSelectorValidatorOptions, TxDuplicateValidatorOptions, TxIpValidatorOptions, TxStrongPasswordOptions, TxUrlValidatorOptions } from './validators.types';

export const TX_DOMAIN_PATTERN =
  '^\\s*([a-zA-Z\\u0400-\\u04FF0-9]{1,63}(-+[a-zA-Z\\u0400-\\u04FF0-9]{1,63})*\\.)+(xn--[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,57}[a-zA-Z0-9])?|[a-zA-Z\\u0400-\\u04FF]{2,63})\\.?\\s*$';

const DOMAIN = new RegExp(TX_DOMAIN_PATTERN);
const PRICE = /^\d{1,12}([.,]\d{1,2})?$/;
const TIME_24 = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ISO_DATE = /^\d{4}-\d{1,2}-\d{1,2}$/;
const IPV4_PART = '(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)';
const IPV4 = new RegExp(`^(?:${IPV4_PART}\\.){3}${IPV4_PART}$`);
const IPV4_CIDR = new RegExp(`^(?:${IPV4_PART}\\.){3}${IPV4_PART}(?:\\/(?:[0-9]|[12][0-9]|3[0-2]))?$`);
const IPV6_CHARS = /^[0-9a-fA-F:.]+$/;
const CONTROL_CHAR_MAX_CODE = 31;
const DELETE_CHAR_CODE = 127;
const UNSAFE_CHARS = ['<', '>'];

const isEmpty = (value: unknown): boolean => value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);

const text = (value: unknown): string => (value ?? '').toString().trim();

function isIpv6(value: string): boolean {
  if (!value.includes(':') || !IPV6_CHARS.test(value)) {
    return false;
  }
  try {
    return !!new URL(`http://[${value}]`).hostname;
  } catch {
    return false;
  }
}

export function parsePrice(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== 'string' || !PRICE.test(value.trim())) {
    return null;
  }
  return Number(value.trim().replace(',', '.'));
}

function numericCode(length = 6): ValidatorFn {
  const pattern = new RegExp(`^\\d{${length}}$`);
  return (control) => (isEmpty(control.value) || pattern.test(String(control.value)) ? null : { invalidCodeFormat: { length } });
}

function isoDate(): ValidatorFn {
  return (control) => {
    const value = control.value;
    if (isEmpty(value)) {
      return null;
    }
    if (typeof value === 'string' && ISO_DATE.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day) {
        return null;
      }
    }
    return { invalidDate: true };
  };
}

function futureDate(): ValidatorFn {
  return (control) => {
    if (isEmpty(control.value)) {
      return null;
    }
    const now = new Date();
    now.setSeconds(0, 0);
    const value = new Date(control.value);
    if (Number.isNaN(value.getTime())) {
      return { invalidDate: true };
    }
    value.setSeconds(0, 0);
    return value < now ? { pastDate: true } : null;
  };
}

function url(options: TxUrlValidatorOptions = {}): ValidatorFn {
  const { https = true, host } = options;
  return (control) => {
    const value = text(control.value);
    if (!value) {
      return null;
    }
    try {
      const parsed = new URL(value);
      const protocolOk = https ? parsed.protocol === 'https:' : parsed.protocol === 'https:' || parsed.protocol === 'http:';
      const hostOk = !host || (typeof host === 'string' ? parsed.hostname === host || parsed.hostname.endsWith(`.${host}`) : host.test(parsed.hostname));
      return protocolOk && hostOk && !/\s/.test(value) ? null : { invalidUrl: true };
    } catch {
      return { invalidUrl: true };
    }
  };
}

function strongPassword(options: TxStrongPasswordOptions = {}): ValidatorFn {
  const { minLength = 6, upper = true, lower = true, digit = false, symbol = true } = options;
  return (control) => {
    const value = control.value;
    if (isEmpty(value)) {
      return null;
    }
    const password = String(value);
    const missing = [
      password.length < minLength && 'length',
      upper && !/\p{Lu}/u.test(password) && 'upper',
      lower && !/\p{Ll}/u.test(password) && 'lower',
      digit && !/\p{N}/u.test(password) && 'digit',
      symbol && !/[^\p{L}\p{N}\s]/u.test(password) && 'symbol',
    ].filter((item): item is string => !!item);
    return missing.length ? { weakPassword: { minLength, missing } } : null;
  };
}

function matchFields(field: string, confirmField: string, errorKey = 'mismatch'): ValidatorFn {
  return (group) => {
    const confirm = group.get(confirmField);
    if (!confirm) {
      return null;
    }
    const mismatch = !isEmpty(confirm.value) && group.get(field)?.value !== confirm.value;
    const { [errorKey]: current, ...others } = confirm.errors ?? {};
    if (mismatch && !current) {
      confirm.setErrors({ ...others, [errorKey]: true });
    }
    if (!mismatch && current) {
      confirm.setErrors(Object.keys(others).length ? others : null);
    }
    return mismatch ? { [errorKey]: true } : null;
  };
}

function distinctFields(first: string, second: string): ValidatorFn {
  return (group) => {
    const left = group.get(first);
    const right = group.get(second);
    if (!left?.enabled || !right?.enabled || isEmpty(left.value)) {
      return null;
    }
    return left.value === right.value ? { distinctControls: true } : null;
  };
}

function ip(options: TxIpValidatorOptions = {}): ValidatorFn {
  const pattern = options.cidr ? IPV4_CIDR : IPV4;
  return (control) => {
    const value = text(control.value);
    if (!value || pattern.test(value) || (options.ipv6 && isIpv6(value.split('/')[0]))) {
      return null;
    }
    return { invalidIp: { value } };
  };
}

function domain(): ValidatorFn {
  return (control) => (isEmpty(control.value) || DOMAIN.test(String(control.value)) ? null : { invalidDomain: true });
}

function duplicate(taken: readonly string[] | (() => readonly string[]), options: TxDuplicateValidatorOptions = {}): ValidatorFn {
  const { message, caseSensitive = false, trim = true } = options;
  const normalize = (raw: unknown): string => {
    let value = (raw ?? '').toString();
    value = trim ? value.trim() : value;
    return caseSensitive ? value : value.toLowerCase();
  };
  return (control) => {
    const value = normalize(control.value);
    const list = typeof taken === 'function' ? taken() : taken;
    if (!value || !list.some((item) => normalize(item) === value)) {
      return null;
    }
    const resolved = typeof message === 'function' ? message() : message;
    return { duplicate: resolved ? { message: resolved } : true };
  };
}

function time24(): ValidatorFn {
  return (control) => (isEmpty(control.value) || TIME_24.test(String(control.value)) ? null : { invalidTime: true });
}

function noUnsafeChars(): ValidatorFn {
  return (control) => {
    const value = control.value;
    if (typeof value !== 'string' || !value) {
      return null;
    }
    for (const char of value) {
      const code = char.charCodeAt(0);
      if (code <= CONTROL_CHAR_MAX_CODE || code === DELETE_CHAR_CODE || UNSAFE_CHARS.includes(char)) {
        return { pattern: true };
      }
    }
    return null;
  };
}

function jsonObject(): ValidatorFn {
  return (control) => {
    const value = text(control.value);
    if (!value) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? null : { invalidJson: true };
    } catch {
      return { invalidJson: true };
    }
  };
}

function exactValue(expected: string, message?: string): ValidatorFn {
  return (control) => {
    const value = text(control.value);
    if (!value || value === expected) {
      return null;
    }
    return { valueMismatch: message ? { message } : { expected } };
  };
}

function cssSelector(options: TxCssSelectorValidatorOptions = {}): ValidatorFn {
  const { allowClass = true, allowId = true } = options;
  const prefixes = `${allowClass ? '.' : ''}${allowId ? '#' : ''}`;
  const requiredPattern = `^[${prefixes}][a-zA-Z_][a-zA-Z0-9_-]*$`;
  const pattern = new RegExp(requiredPattern);
  return (control) => {
    const value = text(control.value);
    if (!value || (prefixes && pattern.test(value))) {
      return null;
    }
    return { pattern: { requiredPattern, actualValue: value } };
  };
}

function requiredWhen(field: string, isRequired: (value: unknown) => boolean = Boolean): ValidatorFn {
  return (control) => {
    const sibling = control.parent?.get(field);
    if (!sibling || !isRequired(sibling.value)) {
      return null;
    }
    return isEmpty(control.value) ? { required: true } : null;
  };
}

function arraySumMax(field: string, max: number): ValidatorFn {
  return (control) => {
    if (!(control instanceof FormArray)) {
      return null;
    }
    const total = control.controls.reduce((sum, item: AbstractControl) => sum + (Number(item.value?.[field]) || 0), 0);
    return total > max ? { sumExceeded: { max, total } } : null;
  };
}

function price(): ValidatorFn {
  return (control): ValidationErrors | null => {
    if (isEmpty(control.value)) {
      return null;
    }
    const parsed = parsePrice(control.value);
    if (parsed === null) {
      return { priceFormat: true };
    }
    return parsed <= 0 ? { pricePositive: true } : null;
  };
}

export const TxValidators = {
  numericCode,
  isoDate,
  futureDate,
  url,
  strongPassword,
  matchFields,
  distinctFields,
  ip,
  domain,
  duplicate,
  time24,
  noUnsafeChars,
  jsonObject,
  exactValue,
  cssSelector,
  requiredWhen,
  arraySumMax,
  price,
} as const;
