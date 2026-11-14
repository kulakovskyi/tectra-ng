import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxColorSwatchOption, TxColorSwatches } from '@tectra-ng/ui/color-swatches';
import { TxTag } from '@tectra-ng/ui/tag';

@Component({
  selector: 'color-swatches-basic-example',
  imports: [FormsModule, TxColorSwatches, TxTag],
  template: `
    <div class="row">
      <tx-color-swatches ariaLabel="Label color" [options]="colors" [(ngModel)]="color" />
      <tx-tag [value]="label()" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorSwatchesBasicExample {
  readonly colors: TxColorSwatchOption[] = [
    { value: 'red', color: '#ef4444', label: 'Red' },
    { value: 'orange', color: '#f97316', label: 'Orange' },
    { value: 'yellow', color: '#eab308', label: 'Yellow' },
    { value: 'green', color: '#22c55e', label: 'Green' },
    { value: 'teal', color: '#14b8a6', label: 'Teal' },
    { value: 'blue', color: '#3b82f6', label: 'Blue' },
    { value: 'violet', color: '#8b5cf6', label: 'Violet' },
    { value: 'pink', color: '#ec4899', label: 'Pink' },
  ];
  readonly color = signal('blue');
  readonly label = computed(
    () => this.colors.find((option) => option.value === this.color())?.label ?? 'None',
  );
}
