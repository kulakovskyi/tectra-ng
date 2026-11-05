import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountry } from '@tectra/ui/country';

@Component({
  selector: 'country-design-tokens-example',
  imports: [TxCountry],
  template: `<tx-country
    [country]="'NO'"
    [size]="'large'"
    [dt]="{ root: { gap: '12px', largeSize: '32px', nameColor: 'var(--tx-primary-base)' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountryDesignTokensExample {}
