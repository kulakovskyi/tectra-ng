import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTagList, TxTagListItem } from '@tectra-ng/ui/tag';

@Component({
  selector: 'tag-list-basic-example',
  imports: [TxTagList],
  template: `
    <div class="rows">
      <tx-tag-list [tags]="tags" [limit]="3" ariaLabel="Article topics" />
      <tx-tag-list [tags]="tags" [limit]="2" rounded ariaLabel="Article topics, rounded" />
    </div>
  `,
  styles: `
    .rows {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagListBasicExample {
  readonly tags: TxTagListItem[] = [
    { value: 'Travel' },
    { value: 'Photography' },
    { value: 'Mountains' },
    { value: 'Hiking' },
    { value: 'Gear' },
    { value: 'Autumn' },
  ];
}
