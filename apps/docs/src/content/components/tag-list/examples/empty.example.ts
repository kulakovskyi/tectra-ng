import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTagList } from '@tectra-ng/ui/tag';

@Component({
  selector: 'tag-list-empty-example',
  imports: [TxTagList],
  template: `
    <div class="rows">
      <tx-tag-list [tags]="[]" ariaLabel="Labels" />
      <tx-tag-list [tags]="[]" emptyText="No labels yet" ariaLabel="Labels" />
    </div>
  `,
  styles: `
    .rows {
      display: grid;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagListEmptyExample {}
