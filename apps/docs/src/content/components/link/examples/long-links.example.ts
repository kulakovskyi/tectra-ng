import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxLink } from '@tectra-ng/ui/link';

@Component({
  selector: 'link-long-links-example',
  imports: [TxLink],
  template: `
    <div class="column">
      <tx-link [link]="long" [maxLength]="40" />
      <div class="narrow"><tx-link [link]="long" /></div>
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .narrow {
      max-width: 240px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkLongLinksExample {
  readonly long =
    'https://example.com/reports/2026/november/traffic-by-country-and-device?range=30d';
}
