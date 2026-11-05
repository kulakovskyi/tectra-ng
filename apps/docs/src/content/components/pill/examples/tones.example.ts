import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill, TxPillTone } from '@tectra/ui/pill';

@Component({
  selector: 'pill-tones-example',
  imports: [TxPill],
  template: `
    <div class="row">
      @for (tone of tones; track tone) {
        <tx-pill [tone]="tone">{{ tone }}</tx-pill>
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PillTonesExample {
  readonly tones: TxPillTone[] = [
    'neutral',
    'primary',
    'success',
    'info',
    'warn',
    'danger',
    'help',
    'contrast',
  ];
}
