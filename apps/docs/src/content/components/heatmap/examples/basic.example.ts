import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxHeatmap,
  TxHeatmapCell,
  TxHeatmapColumnGroup,
  TxHeatmapLegendItem,
  TxHeatmapRow,
  TxHeatmapTone,
} from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';

const DAYS = ['M', 'T', 'W', 'T', 'F'];
const STATES: Record<TxHeatmapTone, string> = {
  success: 'passed',
  danger: 'failed',
  warn: 'flaky',
  info: 'running',
  pending: 'queued',
  neutral: 'skipped',
};

@Component({
  selector: 'heatmap-basic-example',
  imports: [TxCard, TxHeatmap],
  template: `
    <tx-card title="Nightly builds">
      <tx-heatmap
        [groups]="groups"
        [rows]="rows"
        [legend]="legend"
        [labels]="{ rowHeader: 'Service', region: 'Nightly builds' }"
        [dt]="{ heatmap: { leadWidth: '120px' } }"
      />
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapBasicExample {
  readonly groups: TxHeatmapColumnGroup[] = ['Week 1', 'Week 2', 'Week 3'].map((label, week) => ({
    key: `w${week}`,
    label,
    columns: DAYS.map((day, index) => ({ key: `w${week}-${index}`, label: day })),
  }));
  readonly rows: TxHeatmapRow[] = ['api', 'web', 'worker', 'search', 'billing'].map(
    (service, row) => ({
      key: service,
      cells: Array.from({ length: 15 }, (_, index) =>
        this.cell(service, (row * 7 + index * 3) % 11, index),
      ),
    }),
  );
  readonly legend: TxHeatmapLegendItem[] = [
    { tone: 'success', label: 'Passed' },
    { tone: 'warn', label: 'Flaky' },
    { tone: 'danger', label: 'Failed' },
    { tone: 'info', label: 'Running' },
    { tone: 'pending', label: 'Queued' },
  ];

  private cell(service: string, seed: number, index: number): TxHeatmapCell | null {
    if (index === 14) {
      return { tone: 'pending', tooltip: `${service}: queued` };
    }
    if (index === 13) {
      return { tone: 'info', tooltip: `${service}: running` };
    }
    if (seed === 10) {
      return null;
    }
    const tone: TxHeatmapTone = seed < 7 ? 'success' : seed < 9 ? 'warn' : 'danger';
    return { tone, tooltip: `${service}, day ${index + 1}: ${STATES[tone]}` };
  }
}
