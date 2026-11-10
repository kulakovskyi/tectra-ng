import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListInput } from '@tectra-ng/ui/list-input';

@Component({
  selector: 'list-input-states-example',
  imports: [TxListInput],
  template: `
    <div class="fields">
      <tx-list-input type="domain" ariaLabel="Disabled" disabled [rows]="2" text="example.com" />
      <tx-list-input
        type="domain"
        ariaLabel="Read-only"
        readonly
        [rows]="2"
        text="example.com example.org"
      />
      <tx-list-input type="domain" ariaLabel="Invalid" invalid [rows]="2" text="not a domain" />
    </div>
  `,
  styles: `
    .fields {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListInputStatesExample {}
