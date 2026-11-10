import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  TxHeatmap,
  TxHeatmapCalendarValue,
  TxHeatmapLegendItem,
  heatmapCalendar,
} from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';
import { TxLocaleService } from '@tectra-ng/core/i18n';

const DAY = 86_400_000;
const START = Date.UTC(2026, 0, 1);

@Component({
  selector: 'heatmap-calendar-example',
  imports: [TxCard, TxHeatmap],
  template: `
    <tx-card title="Commits in 2026">
      <tx-heatmap
        [groups]="calendar().groups"
        [rows]="calendar().rows"
        [legend]="legend"
        [scaleSteps]="4"
        [labels]="{ empty: 'No commits', region: 'Commits in 2026' }"
        [dt]="{
          heatmap: {
            leadWidth: '36px',
            leadFontSize: '10.5px',
            leadColor: 'var(--tx-text-muted)',
            rowPaddingY: '1.75px',
            rowBorderColor: 'transparent',
          },
        }"
      />
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapCalendarExample {
  private locale = inject(TxLocaleService);

  readonly commits: TxHeatmapCalendarValue[] = Array.from({ length: 365 }, (_, day) => {
    const weekday = new Date(START + day * DAY).getUTCDay();
    const value = weekday === 0 || weekday === 6 ? (day % 5 === 0 ? 2 : 0) : (day * 7) % 13;
    return { date: new Date(START + day * DAY).toISOString().slice(0, 10), value };
  });
  readonly calendar = computed(() =>
    heatmapCalendar(this.commits, {
      from: '2026-01-01',
      to: '2026-12-31',
      intl: this.locale.locale().intl,
    }),
  );
  readonly legend: TxHeatmapLegendItem[] = [
    { value: 3, label: '1–3' },
    { value: 6, label: '4–6' },
    { value: 9, label: '7–9' },
    { value: 12, label: '10+' },
  ];
}
