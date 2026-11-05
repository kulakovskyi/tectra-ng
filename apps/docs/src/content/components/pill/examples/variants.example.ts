import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill, TxPillTone } from '@tectra/ui/pill';

@Component({
  selector: 'pill-variants-example',
  imports: [TxPill],
  template: `
    <div class="grid">
      @for (variant of variants; track variant) {
        <div class="row">
          @for (tone of tones; track tone) {
            <tx-pill [tone]="tone" [variant]="variant" icon="circle-fill">{{ variant }}</tx-pill>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      gap: 10px;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PillVariantsExample {
  readonly variants = ['soft', 'solid', 'outline'] as const;
  readonly tones: TxPillTone[] = ['neutral', 'primary', 'success', 'warn', 'danger'];
}
