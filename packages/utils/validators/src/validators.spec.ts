import { FormArray, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { TxValidators, parsePrice } from './validators';

const check = (validator: ValidatorFn, value: unknown) => validator(new FormControl(value));

describe('TxValidators', () => {
  it('lets empty values through so required decides', () => {
    const single = [
      TxValidators.numericCode(),
      TxValidators.isoDate(),
      TxValidators.futureDate(),
      TxValidators.url(),
      TxValidators.strongPassword(),
      TxValidators.ip(),
      TxValidators.domain(),
      TxValidators.duplicate(['a']),
      TxValidators.time24(),
      TxValidators.noUnsafeChars(),
      TxValidators.jsonObject(),
      TxValidators.exactValue('DELETE'),
      TxValidators.cssSelector(),
      TxValidators.price(),
    ];
    for (const validator of single) {
      expect(check(validator, '')).toBeNull();
      expect(check(validator, null)).toBeNull();
    }
  });

  it('checks numeric codes, ISO dates, future dates and 24-hour time', () => {
    expect(check(TxValidators.numericCode(), '123456')).toBeNull();
    expect(check(TxValidators.numericCode(4), '12a4')).toEqual({ invalidCodeFormat: { length: 4 } });
    expect(check(TxValidators.isoDate(), '2024-02-29')).toBeNull();
    expect(check(TxValidators.isoDate(), '2026-02-30')).toEqual({ invalidDate: true });
    expect(check(TxValidators.futureDate(), new Date(Date.now() + 3_600_000))).toBeNull();
    expect(check(TxValidators.futureDate(), '2020-01-01')).toEqual({ pastDate: true });
    expect(check(TxValidators.time24(), '23:59')).toBeNull();
    expect(check(TxValidators.time24(), '24:00')).toEqual({ invalidTime: true });
  });

  it('checks links with protocol and host rules', () => {
    expect(check(TxValidators.url(), 'https://example.com/a?b=1')).toBeNull();
    expect(check(TxValidators.url(), 'http://example.com')).toEqual({ invalidUrl: true });
    expect(check(TxValidators.url({ https: false }), 'http://example.com')).toBeNull();
    expect(check(TxValidators.url(), 'not a link')).toEqual({ invalidUrl: true });
    expect(check(TxValidators.url({ host: 'figma.com' }), 'https://www.figma.com/file/1')).toBeNull();
    expect(check(TxValidators.url({ host: 'figma.com' }), 'https://notfigma.com')).toEqual({ invalidUrl: true });
    expect(check(TxValidators.url({ host: /^app\./ }), 'https://app.example.com')).toBeNull();
  });

  it('checks password strength and lists what is missing', () => {
    expect(check(TxValidators.strongPassword(), 'Secret!')).toBeNull();
    expect(check(TxValidators.strongPassword(), 'secret')).toEqual({ weakPassword: { minLength: 6, missing: ['upper', 'symbol'] } });
    expect(check(TxValidators.strongPassword({ minLength: 10, digit: true }), 'Пароль!1')).toEqual({ weakPassword: { minLength: 10, missing: ['length'] } });
  });

  it('matches and separates two fields of a group', () => {
    const form = new FormGroup(
      { password: new FormControl('Secret!'), confirm: new FormControl('Secret') },
      { validators: TxValidators.matchFields('password', 'confirm', 'passwordMismatch') },
    );
    expect(form.errors).toEqual({ passwordMismatch: true });
    expect(form.get('confirm')?.errors).toEqual({ passwordMismatch: true });
    form.patchValue({ confirm: 'Secret!' });
    expect(form.errors).toBeNull();
    expect(form.get('confirm')?.errors).toBeNull();

    const pair = new FormGroup({ from: new FormControl('UAH'), to: new FormControl('UAH') }, { validators: TxValidators.distinctFields('from', 'to') });
    expect(pair.errors).toEqual({ distinctControls: true });
    pair.get('to')?.disable();
    expect(pair.errors).toBeNull();
  });

  it('checks IP addresses and domains', () => {
    expect(check(TxValidators.ip(), '192.168.0.1')).toBeNull();
    expect(check(TxValidators.ip(), '256.1.1.1')).toEqual({ invalidIp: { value: '256.1.1.1' } });
    expect(check(TxValidators.ip(), '10.0.0.0/8')).not.toBeNull();
    expect(check(TxValidators.ip({ cidr: true }), '10.0.0.0/8')).toBeNull();
    expect(check(TxValidators.ip({ ipv6: true }), '2001:db8::1')).toBeNull();
    expect(check(TxValidators.ip(), '2001:db8::1')).not.toBeNull();
    expect(check(TxValidators.domain(), 'example.com')).toBeNull();
    expect(check(TxValidators.domain(), 'приклад.укр')).toBeNull();
    expect(check(TxValidators.domain(), 'xn--80ak6aa92e.com')).toBeNull();
    expect(check(TxValidators.domain(), 'no_domain')).toEqual({ invalidDomain: true });
  });

  it('finds duplicates in a list or a getter', () => {
    expect(check(TxValidators.duplicate(['Kyiv']), ' kyiv ')).toEqual({ duplicate: true });
    expect(check(TxValidators.duplicate(['Kyiv'], { caseSensitive: true }), 'kyiv')).toBeNull();
    expect(check(TxValidators.duplicate(() => ['a'], { message: 'Taken' }), 'A')).toEqual({ duplicate: { message: 'Taken' } });
  });

  it('checks text content', () => {
    expect(check(TxValidators.noUnsafeChars(), 'Plain text')).toBeNull();
    expect(check(TxValidators.noUnsafeChars(), '<b>')).toEqual({ pattern: true });
    expect(check(TxValidators.noUnsafeChars(), 'tab\there')).toEqual({ pattern: true });
    expect(check(TxValidators.jsonObject(), '{"a":1}')).toBeNull();
    expect(check(TxValidators.jsonObject(), '[1]')).toEqual({ invalidJson: true });
    expect(check(TxValidators.exactValue('DELETE'), 'delete')).toEqual({ valueMismatch: { expected: 'DELETE' } });
    expect(check(TxValidators.exactValue('DELETE', 'Type DELETE'), 'x')).toEqual({ valueMismatch: { message: 'Type DELETE' } });
    expect(check(TxValidators.cssSelector(), '.card-title')).toBeNull();
    expect(check(TxValidators.cssSelector({ allowId: false }), '#main')).not.toBeNull();
  });

  it('requires a field when a sibling asks for it', () => {
    const form = new FormGroup({ notify: new FormControl(false), email: new FormControl('', TxValidators.requiredWhen('notify')) });
    expect(form.get('email')?.errors).toBeNull();
    form.get('notify')?.setValue(true);
    form.get('email')?.updateValueAndValidity();
    expect(form.get('email')?.errors).toEqual({ required: true });
  });

  it('limits the sum of a field across an array', () => {
    const array = new FormArray([new FormControl({ share: 60 }), new FormControl({ share: 50 })], TxValidators.arraySumMax('share', 100));
    expect(array.errors).toEqual({ sumExceeded: { max: 100, total: 110 } });
  });

  it('parses and checks prices', () => {
    expect(parsePrice('12,5')).toBe(12.5);
    expect(parsePrice(' 7 ')).toBe(7);
    expect(parsePrice('1.234')).toBeNull();
    expect(parsePrice(Number.NaN)).toBeNull();
    expect(check(TxValidators.price(), '0')).toEqual({ pricePositive: true });
    expect(check(TxValidators.price(), '12.999')).toEqual({ priceFormat: true });
    expect(check(TxValidators.price(), 19.99)).toBeNull();
  });
});
