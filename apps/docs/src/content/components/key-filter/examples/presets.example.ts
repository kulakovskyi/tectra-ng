import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxKeyFilter, TxKeyFilterPreset } from '@tectra/ui/key-filter';

@Component({
  selector: 'key-filter-presets-example',
  imports: [TxInput, TxKeyFilter],
  template: `
    <div class="grid">
      @for (preset of presets; track preset) {
        <label class="grid__item">
          <code>{{ preset }}</code>
          <input txInput [fluid]="true" [txKeyFilter]="preset" [attr.aria-label]="preset" />
        </label>
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
