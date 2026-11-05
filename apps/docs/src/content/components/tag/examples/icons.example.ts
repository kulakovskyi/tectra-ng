import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTag } from '@tectra/ui/tag';

@Component({
  selector: 'tag-icons-example',
  imports: [TxTag],
  template: `
    <div class="row">
      <tx-tag severity="success" icon="check" value="Released" />
      <tx-tag severity="info" icon="info-circle" value="Beta" />
      <tx-tag severity="danger" icon="pi-times" value="Breaking" />
      <tx-tag severity="secondary" icon="code-branch" value="main" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagIconsExample {}
