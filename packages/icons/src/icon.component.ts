import { ChangeDetectionStrategy, Component, computed, inject, input, isDevMode } from '@angular/core';
import { injectTxIcons } from './icon-defaults';
import { TxIconRegistry } from './icon-registry.service';
import { TxIconName } from './icons';

@Component({
  selector: 'tx-icon',
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @for (path of paths(); track $index) {
        <path
          [attr.d]="path.d"
          [attr.fill]="path.fill ? 'currentColor' : null"
          [attr.stroke]="path.stroke === false ? 'none' : null"
          [attr.transform]="path.transform ?? null"
        />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--tx-icon-size, 1em);
      height: var(--tx-icon-size, 1em);
    }

    svg {
      width: 100%;
      height: 100%;
      stroke-width: var(--tx-icon-stroke-width, 1.75);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-icon', '[attr.data-icon]': 'name()' },
})
export class TxIcon {
  private txIconRegistry = inject(TxIconRegistry);
  private icons = injectTxIcons();

  readonly name = input.required<TxIconName | (string & {})>();
  readonly paths = computed(() =>
    (this.icons.get(this.name()) ?? this.missing(this.name())).map((path) => (typeof path === 'string' ? { d: path } : path)) as {
      d: string;
      fill?: true;
      stroke?: false;
      transform?: string;
    }[],
  );

  private missing(name: string): [] {
    if (isDevMode() && name) {
      this.txIconRegistry.warnMissing(name);
    }
    return [];
  }
}
