import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxLink } from '@tectra/ui/link';

@Component({
  selector: 'link-types-example',
  imports: [TxLink],
  template: `
    <div class="column">
      <tx-link link="support@example.com" type="email" />
      <tx-link link="+380 44 123 45 67" type="phone" />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkTypesExample {}
