import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectTxIcons, provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TxInputIconPosition } from './icon-field.types';
import { ICON_FIELD_ICON_DEFAULTS } from './icon-field.icons';

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
  viewProviders: [provideTxIconDefaults(ICON_FIELD_ICON_DEFAULTS)],
})
export class TxInputIcon {
  private txIconRegistry = injectTxIcons();

  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly position = input<TxInputIconPosition>('start');

  readonly iconName = computed(() => {
    const icon = this.icon();
    return this.txIconRegistry.has(icon) ? icon : null;
  });
}
