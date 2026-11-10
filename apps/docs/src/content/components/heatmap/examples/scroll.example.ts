import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxHeatmap,
  TxHeatmapColumnGroup,
  TxHeatmapRow,
  TxHeatmapRowValue,
} from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';

const REGIONS = [
  'eu-west',
  'eu-central',
  'us-east',
  'us-west',
  'ap-south',
  'ap-east',
  'sa-east',
  'af-south',
];
const SERVICES = [
  'Auth',
  'Billing',
  'Search',
  'Storage',
  'Mail',
  'Queue',
  'Media',
  'Reports',
  'Maps',
  'Chat',
  'Feeds',
  'Export',
];

@Component({
  selector: 'heatmap-scroll-example',
  imports: [TxCard, TxHeatmap, TxHeatmapRowValue],
  template: `
    <tx-card title="Uptime by region">
      <tx-heatmap
        [groups]="groups"
        [rows]="rows"
        maxHeight="240px"
        [labels]="{ rowHeader: 'Service', valueHeader: 'Uptime', region: 'Uptime by region' }"
        [dt]="{ heatmap: { leadWidth: '96px' } }"
      >
        <ng-template txHeatmapRowValue let-row>
          <strong>{{ row.data }}</strong>
        </ng-template>
      </tx-heatmap>
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapScrollExample {
  readonly groups: TxHeatmapColumnGroup[] = REGIONS.map((region) => ({
    key: region,
    label: region,
    columns: ['W1', 'W2', 'W3', 'W4'].map((week) => ({
      key: `${region}-${week}`,
      label: week.slice(1),
    })),
  }));
  readonly rows: TxHeatmapRow[] = SERVICES.map((service, row) => {
    const cells = Array.from({ length: REGIONS.length * 4 }, (_, index) => {
      const seed = (row * 11 + index * 5) % 17;
      const tone = seed === 0 ? 'danger' : seed < 3 ? 'warn' : 'success';
      return {
        tone,
        tooltip: `${service}, ${REGIONS[Math.floor(index / 4)]}: ${tone === 'success' ? 'up' : tone === 'warn' ? 'degraded' : 'down'}`,
      } as const;
    });
    const down = cells.filter((cell) => cell.tone !== 'success').length;
    return { key: service, data: `${(100 - down * 0.4).toFixed(1)}%`, cells };
  });
}
