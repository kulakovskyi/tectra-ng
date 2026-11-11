import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxBreakpoints } from '@tectra-ng/utils/breakpoint';

@Component({
  selector: 'breakpoint-media-query-example',
  imports: [TxTable, TxTableCell],
  template: `
    <tx-table ariaLabel="Media queries" dataKey="query" [value]="rows" [columns]="columns">
      <ng-template txTableCell="query" let-value="value"
        ><code>{{ value }}</code></ng-template
      >
      <ng-template txTableCell="matches" let-row>{{ row.matches() ? 'yes' : 'no' }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreakpointMediaQueryExample {
  private readonly breakpoints = inject(TxBreakpoints);

  readonly rows = [
    '(min-width: 1200px)',
    '(orientation: portrait)',
    '(prefers-color-scheme: dark)',
    '(prefers-reduced-motion: reduce)',
    '(hover: hover)',
  ].map((query) => ({ query, matches: this.breakpoints.matches(query) }));
  readonly columns: TxTableColumn[] = [
    { field: 'query', header: 'Query' },
    { field: 'matches', header: 'Matches' },
  ];
}
