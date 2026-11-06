import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSparkline, TxSparklineTone } from '@tectra-ng/ui/sparkline';

@Component({
  selector: 'sparkline-tones-example',
  imports: [TxSparkline],
  template: `
    <div class="grid">
      @for (tone of tones; track tone) {
        <figure>
          <tx-sparkline [values]="values" [tone]="tone" />
          <figcaption>{{ tone }}</figcaption>
        </figure>
      }
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 24px;
      width: 100%;
    }
    figure {
      margin: 0;
    }
    figcaption {
      margin-top: 8px;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SparklineTonesExample {
  readonly tones: TxSparklineTone[] = ['primary', 'info', 'success', 'warn', 'danger'];
  readonly values = [8, 12, 9, 14, 11, 18, 16, 21];
}
