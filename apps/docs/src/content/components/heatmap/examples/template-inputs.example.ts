import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  input,
} from '@angular/core';
import {
  TxHeatmap,
  TxHeatmapColumnGroup,
  TxHeatmapRow,
  TxHeatmapRowContext,
} from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';
import { TxPill } from '@tectra-ng/ui/pill';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

@Component({
  selector: 'uptime-heatmap',
  imports: [TxCard, TxHeatmap],
  template: `
    <tx-card [title]="title()">
      <tx-heatmap
        [groups]="groups"
        [rows]="rows()"
        [labels]="{ rowHeader: 'Service', valueHeader: 'Uptime' }"
        [rowHeaderTemplate]="header()"
        [rowValueTemplate]="value()"
      />
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UptimeHeatmap {
  readonly title = input('');
  readonly rows = input<TxHeatmapRow[]>([]);
  readonly header = contentChild('header', { read: TemplateRef<TxHeatmapRowContext> });
  readonly value = contentChild('value', { read: TemplateRef<TxHeatmapRowContext> });
  readonly groups: TxHeatmapColumnGroup[] = [
    {
      key: 'week',
      label: 'This week',
      columns: DAYS.map((day) => ({ key: day, label: day[0] })),
    },
  ];
}

@Component({
  selector: 'heatmap-template-inputs-example',
  imports: [UptimeHeatmap, TxPill],
  template: `
    <uptime-heatmap title="Uptime" [rows]="rows">
      <ng-template #header let-row
        ><strong>{{ row.key }}</strong></ng-template
      >
      <ng-template #value let-row>
        <tx-pill size="small" [tone]="row.data >= 99 ? 'success' : 'warn'">{{ row.data }}%</tx-pill>
      </ng-template>
    </uptime-heatmap>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapTemplateInputsExample {
  readonly rows: TxHeatmapRow[] = [
    { key: 'API', data: 99.9, cells: DAYS.map(() => ({ tone: 'success' as const })) },
    {
      key: 'Search',
      data: 97.2,
      cells: DAYS.map((day) =>
        day === 'Wed'
          ? { tone: 'danger' as const, tooltip: 'Wed: 40 min down' }
          : { tone: 'success' as const },
      ),
    },
    { key: 'Billing', data: 99.5, cells: DAYS.map(() => ({ tone: 'success' as const })) },
  ];
}
