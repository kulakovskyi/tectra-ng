import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TX_ICONS, TxIconName } from './icons';

@Component({
  selector: 'tx-icon',
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host { display: inline-flex; width: 1em; height: 1em; }
    svg { width: 100%; height: 100%; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxIcon {
  name = input.required<TxIconName>();
  path = computed(() => TX_ICONS[this.name()]);
}
