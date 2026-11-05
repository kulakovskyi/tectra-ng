import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra/icons';
import { TxInputIconPosition } from './icon-field.types';

@Component({
  selector: 'tx-input-icon',
  imports: [TxIcon],
  template: `
    @if (iconName(); as name) {
      <tx-icon [name]="name" />
    } @else if (icon()) {
      <span [class]="icon()"></span>
    }
    <ng-content />
  `,
  styleUrl: './input-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-input-icon', 'aria-hidden': 'true' },
})
export class TxInputIcon {
  private txIconRegistry = inject(TxIconRegistry);

  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly position = input<TxInputIconPosition>('start');

  readonly iconName = computed(() => {
    const icon = this.icon();
    return this.txIconRegistry.has(icon) ? icon : null;
  });
}
