import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxInput } from '@tectra/ui/input';
import { TxInputGroup } from '@tectra/ui/input-group';
import { TxKeyFilter } from '@tectra/ui/key-filter';

@Component({
  selector: 'input-group-buttons-example',
  imports: [TxInputGroup, TxInput, TxButton, TxKeyFilter, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-input-group>
        <input txInput placeholder="Keyword" aria-label="Keyword" [formControl]="keyword" />
        <button txButton [icon]="'search'" aria-label="Search" (click)="search()"></button>
      </tx-input-group>
      <span class="hint">Searched: {{ searched || '—' }}</span>
      <tx-input-group>
        <button txButton [severity]="'secondary'" [icon]="'minus'" aria-label="Less" [disabled]="quantity.value <= min" (click)="step(-1)"></button>
        <input txInput [txKeyFilter]="'pint'" aria-label="Quantity" [formControl]="quantity" (blur)="clamp()" />
        <button txButton [severity]="'secondary'" [icon]="'plus'" aria-label="More" [disabled]="quantity.value >= max" (click)="step(1)"></button>
      </tx-input-group>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputGroupButtonsExample {
  readonly min = 0;
  readonly max = 99;
  readonly keyword = new FormControl('', { nonNullable: true });
  readonly quantity = new FormControl(3, { nonNullable: true });
  searched = '';

  search(): void {
    this.searched = this.keyword.value;
  }

  step(delta: number): void {
    this.quantity.setValue(Math.min(this.max, Math.max(this.min, Number(this.quantity.value) + delta)));
  }

  clamp(): void {
    this.step(0);
  }
}
