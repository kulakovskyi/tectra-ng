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

  it('treats an empty list as empty and rejects dates of the wrong shape', () => {
    expect(check(TxValidators.numericCode(), [])).toBeNull();
    expect(check(TxValidators.isoDate(), 20240101)).toEqual({ invalidDate: true });
    expect(check(TxValidators.isoDate(), '01.02.2024')).toEqual({ invalidDate: true });
    expect(check(TxValidators.futureDate(), 'someday')).toEqual({ invalidDate: true });
  });

  it('rejects text that only looks like an IPv6 address', () => {
    expect(check(TxValidators.ip({ ipv6: true }), 'example')).toEqual({ invalidIp: { value: 'example' } });
    expect(check(TxValidators.ip({ ipv6: true }), '1:2:3:4:5:6:7:8:9')).toEqual({ invalidIp: { value: '1:2:3:4:5:6:7:8:9' } });
  });

  it('lists missing lower case letters and digits', () => {
    expect(check(TxValidators.strongPassword({ digit: true }), 'SECRET!')).toEqual({ weakPassword: { minLength: 6, missing: ['lower', 'digit'] } });
  });

  it('keeps other errors of the confirm field and skips a group without it', () => {
    const form = new FormGroup(
      { password: new FormControl('Secret!'), confirm: new FormControl('Secret!') },
      { validators: TxValidators.matchFields('password', 'confirm') },
    );
    const confirm = form.get('confirm') as FormControl;
    confirm.setErrors({ mismatch: true, server: true });
    form.updateValueAndValidity();
    expect(confirm.errors).toEqual({ server: true });

    form.patchValue({ password: 'Other!' });
    expect(confirm.errors).toEqual({ server: true, mismatch: true });
    form.patchValue({ password: 'Secret!' });
    expect(confirm.errors).toEqual({ server: true });
    confirm.setErrors({ mismatch: true });
    form.updateValueAndValidity();
    expect(confirm.errors).toBeNull();

    const lone = new FormGroup({ password: new FormControl('a') }, { validators: TxValidators.matchFields('password', 'confirm') });
    expect(lone.errors).toBeNull();
  });

  it('accepts two different values as distinct', () => {
    const pair = new FormGroup({ from: new FormControl('UAH'), to: new FormControl('USD') }, { validators: TxValidators.distinctFields('from', 'to') });
    expect(pair.errors).toBeNull();
  });

  it('compares duplicates without trimming and with a message getter', () => {
    expect(check(TxValidators.duplicate(['Kyiv'], { trim: false }), ' Kyiv ')).toBeNull();
    expect(check(TxValidators.duplicate(['Kyiv'], { message: () => 'Already added' }), 'Kyiv')).toEqual({ duplicate: { message: 'Already added' } });
  });

  it('rejects broken JSON and selectors when no prefix is allowed', () => {
    expect(check(TxValidators.jsonObject(), '{a:')).toEqual({ invalidJson: true });
    expect(check(TxValidators.cssSelector({ allowClass: false }), '#main')).toBeNull();
    expect(check(TxValidators.cssSelector({ allowClass: false, allowId: false }), '.card')).toEqual({ pattern: { requiredPattern: '^[][a-zA-Z_][a-zA-Z0-9_-]*$', actualValue: '.card' } });
  });

  it('accepts a filled field that a sibling requires', () => {
    const form = new FormGroup({ notify: new FormControl(true), email: new FormControl('a@b.c', TxValidators.requiredWhen('notify')) });
    form.get('email')?.updateValueAndValidity();
    expect(form.get('email')?.errors).toBeNull();
  });

  it('sums only numbers inside an array and ignores other controls', () => {
    const array = new FormArray([new FormControl({ share: 60 }), new FormControl(null), new FormControl({ other: 1 })], TxValidators.arraySumMax('share', 100));
    expect(array.errors).toBeNull();
    expect(check(TxValidators.arraySumMax('share', 1), { share: 5 })).toBeNull();
  });
});
