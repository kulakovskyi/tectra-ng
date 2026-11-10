import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxHeatmap,
  TxHeatmapColumnGroup,
  TxHeatmapLegendItem,
  TxHeatmapRow,
} from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';

const TEAMS = ['Design', 'Platform', 'Data', 'Mobile'];

@Component({
  selector: 'heatmap-design-tokens-example',
  imports: [TxCard, TxHeatmap],
  template: `
    <tx-card title="Releases">
      <tx-heatmap
        [groups]="groups"
        [rows]="rows"
        [legend]="legend"
        [labels]="{ empty: 'Off' }"
        [dt]="{
          heatmap: {
            leadWidth: '80px',
            cellSize: '20px',
            cellRadius: '999px',
            columnGap: '6px',
            scaleColor: 'var(--tx-green-500)',
          },
        }"
      />
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapDesignTokensExample {
  readonly groups: TxHeatmapColumnGroup[] = [
    {
      key: 'week',
      label: 'This week',
      columns: ['M', 'T', 'W', 'T', 'F'].map((label, index) => ({ key: `d${index}`, label })),
    },
  ];
  readonly rows: TxHeatmapRow[] = TEAMS.map((team, row) => ({
    key: team,
    cells: Array.from({ length: 5 }, (_, day) => {
      const value = (row * 3 + day * 2) % 6;
      return { value, tooltip: `${team}: ${value} releases` };
    }),
  }));
  readonly legend: TxHeatmapLegendItem[] = [
    { value: 1, label: '1' },
    { value: 3, label: '3' },
    { value: 5, label: '5' },
  ];
}
