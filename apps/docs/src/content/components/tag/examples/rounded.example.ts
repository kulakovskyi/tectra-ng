import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTag } from '@tectra-ng/ui/tag';

@Component({
  selector: 'tag-rounded-example',
  imports: [TxTag],
  template: `
    <div class="row">
      <tx-tag [rounded]="true" value="v2.4.0" />
      <tx-tag [rounded]="true" severity="success" value="Stable" />
      <tx-tag [rounded]="true" severity="warn" value="Deprecated" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagRoundedExample {}
