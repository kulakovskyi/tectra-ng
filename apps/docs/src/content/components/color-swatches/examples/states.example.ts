import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxColorSwatchOption, TxColorSwatches } from '@tectra-ng/ui/color-swatches';

@Component({
  selector: 'color-swatches-states-example',
  imports: [FormsModule, TxColorSwatches],
  template: `
    <div class="list">
      <div class="row">
        <tx-color-swatches ariaLabel="Plan color" [options]="colors" [(ngModel)]="plan" />
        <span class="hint">Violet is taken</span>
      </div>
      <div class="row">
        <tx-color-swatches
          ariaLabel="Readonly"
          [readonly]="true"
          [options]="colors"
          [ngModel]="'green'"
        />
        <span class="hint">Readonly</span>
      </div>
      <div class="row">
        <tx-color-swatches
          ariaLabel="Disabled"
          [disabled]="true"
          [options]="colors"
          [ngModel]="'blue'"
        />
        <span class="hint">Disabled</span>
      </div>
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 12px;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hint {
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorSwatchesStatesExample {
  readonly colors: TxColorSwatchOption[] = [
    { value: 'green', color: '#22c55e', label: 'Green' },
    { value: 'blue', color: '#3b82f6', label: 'Blue' },
    { value: 'violet', color: '#8b5cf6', label: 'Violet', disabled: true },
    { value: 'orange', color: '#f97316', label: 'Orange' },
  ];
  plan = 'blue';
}
