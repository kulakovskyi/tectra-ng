import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-unstyled-example',
  imports: [TxSelectButton],
  template: `
    <tx-select-button
      class="own"
      ariaLabel="Units"
      [unstyled]="true"
      [options]="units"
      [(value)]="unit"
    />
  `,
  styles: `
    .own {
      gap: 4px;
    }
    .own ::ng-deep .tx-select-button__item {
      padding: 6px 12px;
      border: 2px dashed var(--tx-surface-border);
      background: none;
      color: var(--tx-text-primary);
      font: inherit;
    }
    .own ::ng-deep .tx-select-button__item--selected {
      border-style: solid;
      border-color: var(--tx-primary-base);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonUnstyledExample {
  readonly units = ['Metric', 'Imperial'];
  readonly unit = signal<unknown>('Metric');
}
