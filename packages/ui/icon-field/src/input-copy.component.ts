import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxIcon } from '@tectra-ng/icons';
import { TxIconField } from './icon-field.component';

@Component({
  selector: 'tx-input-copy',
  imports: [TxIcon],
  template: `
    <button
      type="button"
      class="tx-input-action"
      [class.tx-input-action--done]="isCopied()"
      [attr.aria-label]="isCopied() ? translations().copied : translations().copy"
      [title]="isCopied() ? translations().copied : translations().copy"
      (click)="copy()"
    >
      <tx-icon [name]="isCopied() ? 'check' : 'copy'" />
    </button>
  `,
  styleUrl: './input-action.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-input-copy' },
})
export class TxInputCopy {
  private field = inject(TxIconField);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly translations = injectTranslations();
  readonly isCopied = signal(false);

  readonly copied = output<string>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timer && clearTimeout(this.timer));
  }

  copy(): void {
    const value = this.field.value();
    navigator.clipboard?.writeText(value);
    this.isCopied.set(true);
    this.copied.emit(value);
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.isCopied.set(false), 1500);
  }
}
