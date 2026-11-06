import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTag } from '@tectra-ng/ui/tag';

@Component({
  selector: 'tag-sizes-example',
  imports: [TxTag],
  template: `
    <div class="row">
      <tx-tag size="small" value="Small" />
      <tx-tag value="Medium" />
      <tx-tag size="large" value="Large" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagSizesExample {}
