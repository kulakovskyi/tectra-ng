import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-icon-only-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group aria-label="Zoom">
      <button
        txButton
        [outlined]="true"
        [severity]="'secondary'"
        [icon]="'search-minus'"
        [disabled]="zoom() <= 50"
        aria-label="Zoom out"
        (click)="change(-25)"
      ></button>
      <button
        txButton
        [outlined]="true"
        [severity]="'secondary'"
        [attr.aria-label]="label() + ', reset zoom'"
        class="zoom-value"
        (click)="zoom.set(100)"
      >
        {{ label() }}
      </button>
      <button
        txButton
        [outlined]="true"
        [severity]="'secondary'"
        [icon]="'search-plus'"
        [disabled]="zoom() >= 200"
        aria-label="Zoom in"
        (click)="change(25)"
      ></button>
    </tx-button-group>
  `,
  styles: `
    .zoom-value {
      min-width: 4.5rem;
      font-variant-numeric: tabular-nums;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupIconOnlyExample {
  readonly zoom = signal(100);
  readonly label = computed(() => `${this.zoom()}%`);

  change(step: number): void {
    this.zoom.update((value) => Math.min(200, Math.max(50, value + step)));
  }
}
