import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSparkline, TxSparklineTone } from '@tectra-ng/ui/sparkline';

interface Campaign {
  name: string;
  clicks: string;
  tone: TxSparklineTone;
  trend: number[];
}

@Component({
  selector: 'sparkline-size-example',
  imports: [TxSparkline],
  template: `
    <ul class="rows" aria-label="Campaigns">
      @for (campaign of campaigns; track campaign.name) {
        <li>
          <span class="name">{{ campaign.name }}</span>
          <tx-sparkline class="trend" [values]="campaign.trend" [tone]="campaign.tone" />
          <span class="clicks">{{ campaign.clicks }}</span>
        </li>
      }
    </ul>
  `,
  styles: `
    .rows {
      display: grid;
      gap: 4px;
      width: 100%;
      max-width: 480px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      grid-template-columns: 1fr 96px 64px;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
      border-bottom: 1px solid var(--tx-surface-border);
      font-size: 14px;
    }
    .trend {
      height: 24px;
    }
    .clicks {
      text-align: end;
      font-variant-numeric: tabular-nums;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SparklineSizeExample {
  readonly campaigns: Campaign[] = [
    { name: 'Spring sale', clicks: '8,412', tone: 'success', trend: [3, 5, 4, 7, 9, 8, 12] },
    { name: 'Newsletter', clicks: '2,180', tone: 'primary', trend: [6, 6, 7, 6, 8, 7, 8] },
    { name: 'Retargeting', clicks: '904', tone: 'danger', trend: [12, 10, 11, 8, 7, 5, 4] },
  ];
}
