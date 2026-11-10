import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxHeatmap,
  TxHeatmapCellClick,
  TxHeatmapColumnGroup,
  TxHeatmapLegendItem,
  TxHeatmapRow,
} from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';
import { TxMessage } from '@tectra-ng/ui/message';

const YEARS = ['2024', '2025', '2026'];
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@Component({
  selector: 'heatmap-interactive-example',
  imports: [TxCard, TxHeatmap, TxMessage],
  template: `
    <div class="wrap">
      <tx-card title="Deadlines by month">
        <tx-heatmap
          [groups]="groups"
          [rows]="rows"
          [legend]="legend"
          [labels]="{ rowHeader: 'Year', empty: 'No deadlines' }"
          [dt]="{ heatmap: { leadWidth: '46px' } }"
          (cellClick)="selected.set($event)"
        />
      </tx-card>
      <tx-message severity="secondary" size="small">
        @if (selected(); as click) {
          {{ click.cell.tooltip }} — opened the report for {{ click.columnKey }}.
        } @else {
          Click a month or focus it and press Enter.
        }
      </tx-message>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapInteractiveExample {
  readonly selected = signal<TxHeatmapCellClick | null>(null);
  readonly groups: TxHeatmapColumnGroup[] = [
    {
      key: 'months',
      label: 'Months',
      columns: MONTHS.map((label, index) => ({ key: NAMES[index], label })),
    },
  ];
  readonly rows: TxHeatmapRow[] = YEARS.map((year, row) => ({
    key: year,
    cells: MONTHS.map((_, month) => {
      if (year === '2026' && month > 9) {
        return null;
      }
      const missed = (row * 5 + month * 3) % 7;
      const tone = missed === 0 ? 'danger' : missed < 3 ? 'warn' : 'success';
      const text =
        tone === 'danger' ? 'deadlines missed' : tone === 'warn' ? 'some late' : 'all on time';
      return { tone, tooltip: `${NAMES[month]} ${year}: ${text}`, interactive: true };
    }),
  }));
  readonly legend: TxHeatmapLegendItem[] = [
    { tone: 'success', label: 'All on time' },
    { tone: 'warn', label: 'Some late' },
    { tone: 'danger', label: 'Missed' },
  ];
}
