import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxHeatmap,
  TxHeatmapColumnGroup,
  TxHeatmapLegendItem,
  TxHeatmapRow,
} from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PARTS = [
  { key: 'night', label: 'Night', hours: [0, 3] },
  { key: 'morning', label: 'Morning', hours: [6, 9] },
  { key: 'day', label: 'Day', hours: [12, 15] },
  { key: 'evening', label: 'Evening', hours: [18, 21] },
];

@Component({
  selector: 'heatmap-value-scale-example',
  imports: [TxCard, TxHeatmap],
  template: `
    <tx-card title="Visits by hour">
      <tx-heatmap
        [groups]="groups"
        [rows]="rows"
        [legend]="legend"
        [scaleSteps]="4"
        [scaleMax]="120"
        [labels]="{ rowHeader: 'Day', empty: 'No visits', region: 'Visits by hour' }"
        [dt]="{ heatmap: { leadWidth: '48px' } }"
      />
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapValueScaleExample {
  readonly groups: TxHeatmapColumnGroup[] = PARTS.map((part) => ({
    key: part.key,
    label: part.label,
    columns: part.hours.map((hour) => ({ key: `${hour}`, label: String(hour) })),
  }));
  readonly rows: TxHeatmapRow[] = DAYS.map((day, index) => ({
    key: day,
    cells: PARTS.flatMap((part) =>
      part.hours.map((hour) => {
        const weekend = index > 4;
        const value =
          hour < 6
            ? (index * 3) % 4
            : Math.round((weekend ? 40 : 80) + 40 * Math.sin((hour + index) / 4));
        return { value, tooltip: `${day} ${hour}:00 — ${value} visits` };
      }),
    ),
  }));
  readonly legend: TxHeatmapLegendItem[] = [
    { value: 30, label: '1–30' },
    { value: 60, label: '31–60' },
    { value: 90, label: '61–90' },
    { value: 120, label: '91+' },
  ];
}
