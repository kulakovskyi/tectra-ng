# Validators

Form validators apps write again and again, next to Angular's `Validators`. Every one lets an empty value through (pair it with `Validators.required`), and every error key has a translated text in `tx-field-error` / `tx-field`, so a field shows a message with no extra setup.

```ts
readonly form = new FormGroup(
  {
    website: new FormControl('', TxValidators.url()),
    password: new FormControl('', [Validators.required, TxValidators.strongPassword()]),
    confirm: new FormControl(''),
  },
  { validators: TxValidators.matchFields('password', 'confirm', 'passwordMismatch') },
);
```

## Functions
| Name | Description |
|---|---|
| TxValidators.numericCode(length?) | Exactly `length` digits (6) — one-time codes. Error `invalidCodeFormat: { length }` |
| TxValidators.isoDate() | A real calendar date as `yyyy-MM-dd`. Error `invalidDate` |
| TxValidators.futureDate() | Not earlier than the current minute. Error `pastDate` |
| TxValidators.url({ https?, host? }) | A link; `https` only by default (`false` allows `http`); `host` — a domain (subdomains pass) or a RegExp. Error `invalidUrl` |
| TxValidators.strongPassword({ minLength?, upper?, lower?, digit?, symbol? }) | 6+ characters with upper and lower case letters and a symbol by default; any script. Error `weakPassword: { minLength, missing }` |
| TxValidators.matchFields(field, confirmField, errorKey?) | Group validator: the second field equals the first; the error also lands on the second field. Error `mismatch` (or your key, e.g. `passwordMismatch`) |
| TxValidators.distinctFields(first, second) | Group validator: two enabled fields differ. Error `distinctControls` |
| TxValidators.ip({ cidr?, ipv6? }) | IPv4, with a `/mask` when `cidr`, IPv6 when `ipv6`. Error `invalidIp: { value }` |
| TxValidators.domain() | A domain name, Cyrillic and punycode included. Error `invalidDomain` |
| TxValidators.duplicate(taken, { message?, caseSensitive?, trim? }) | Not one of the taken values (an array or a getter). Error `duplicate` |
| TxValidators.time24() | `HH:mm` from `00:00` to `23:59`. Error `invalidTime` |
| TxValidators.noUnsafeChars() | No control characters, `<` or `>`. Error `pattern` |
| TxValidators.jsonObject() | Text that parses to a JSON object. Error `invalidJson` |
| TxValidators.exactValue(expected, message?) | Typed confirmation ("type DELETE"). Error `valueMismatch: { expected }` |
| TxValidators.cssSelector({ allowClass?, allowId? }) | `.class` or `#id`. Error `pattern` |
| TxValidators.requiredWhen(field, isRequired?) | Required while a sibling field is set (or `isRequired(value)` says so). Error `required` |
| TxValidators.arraySumMax(field, max) | Array validator: the sum of `field` over the rows is at most `max`. Error `sumExceeded: { max, total }` |
| TxValidators.price() | Up to 12 digits and 2 decimals, `.` or `,`, above zero. Errors `priceFormat`, `pricePositive` |
| parsePrice(value) | A number from a price text, or `null` |

## Constants
| Name | Description |
|---|---|
| TX_DOMAIN_PATTERN | The domain pattern as a string, for `Validators.pattern` or a key filter |
