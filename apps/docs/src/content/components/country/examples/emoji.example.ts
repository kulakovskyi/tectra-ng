import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountry, provideTxFlags } from '@tectra-ng/ui/country';

@Component({
  selector: 'country-emoji-example',
  imports: [TxCountry],
  providers: [provideTxFlags(() => null)],
  template: `
    <div class="flex">
      <tx-country [country]="'UA'" />
      <tx-country [country]="'PL'" />
      <tx-country [country]="'DE'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountryEmojiExample {}
