import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxHeatmap, TxHeatmapColumnGroup, TxHeatmapRow } from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';

const SHIFTS = ['Early', 'Late', 'Night'];

@Component({
  selector: 'heatmap-pass-through-example',
  imports: [TxCard, TxHeatmap],
  template: `
    <tx-card title="Shift coverage">
      <tx-heatmap
        [groups]="groups"
        [rows]="rows"
        [labels]="{ rowHeader: 'Shift' }"
        [dt]="{ heatmap: { leadWidth: '64px' } }"
        [pt]="{
          lead: { style: { fontWeight: '600' } },
          groupLabel: { style: { textTransform: 'uppercase', letterSpacing: '0.04em' } },
        }"
      />
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapPassThroughExample {
  readonly groups: TxHeatmapColumnGroup[] = ['Mon', 'Tue', 'Wed'].map((day) => ({
    key: day,
    label: day,
    columns: [1, 2, 3].map((slot) => ({ key: `${day}-${slot}`, label: String(slot) })),
  }));
  readonly rows: TxHeatmapRow[] = SHIFTS.map((shift, row) => ({
    key: shift,
    cells: Array.from({ length: 9 }, (_, index) => ({
      tone: (row + index) % 4 === 0 ? 'neutral' : 'success',
      tooltip: `${shift}, slot ${(index % 3) + 1}`,
    })),
  }));
}
