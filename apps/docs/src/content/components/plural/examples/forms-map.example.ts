import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxPluralPipe } from '@tectra-ng/utils/plural';

@Component({
  selector: 'plural-forms-map-example',
  imports: [TxTable, TxTableCell, TxPluralPipe],
  template: `
    <tx-table ariaLabel="Plural forms" dataKey="count" [value]="rows" [columns]="columns">
      <ng-template txTableCell="english" let-row>{{
        row.count | txPlural: english : 'en-US'
      }}</ng-template>
      <ng-template txTableCell="ukrainian" let-row>{{
        row.count | txPlural: ukrainian : 'uk-UA'
      }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PluralFormsMapExample {
  readonly english = { '=0': 'no days', one: '# day', other: '# days' };
  readonly ukrainian = { '=0': 'жодного дня', one: '# день', few: '# дні', many: '# днів' };
  readonly rows = [0, 1, 2, 5, 11, 21, 22, 25].map((count) => ({ count }));
  readonly columns: TxTableColumn[] = [
    { field: 'count', header: 'Count', align: 'end' },
    { field: 'english', header: 'English' },
    { field: 'ukrainian', header: 'Українська' },
  ];
}
