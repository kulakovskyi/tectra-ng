import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxKeyFilter, TxKeyFilterPreset } from '@tectra-ng/ui/key-filter';
import { TxLabel } from '@tectra-ng/ui/label';

@Component({
  selector: 'key-filter-presets-example',
  imports: [TxInput, TxKeyFilter, TxLabel],
  template: `
    <div class="grid">
      @for (preset of presets; track preset) {
        <div class="grid__item">
          <tx-label [for]="'key-filter-preset-' + preset"
            ><code>{{ preset }}</code></tx-label
          >
          <input
            txInput
            [id]="'key-filter-preset-' + preset"
            [fluid]="true"
            [txKeyFilter]="preset"
          />
        </div>
      }
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    .grid__item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KeyFilterPresetsExample {
  readonly presets: TxKeyFilterPreset[] = [
    'pint',
    'int',
    'pnum',
    'num',
    'money',
    'hex',
    'email',
    'alpha',
    'alphanum',
  ];
}
