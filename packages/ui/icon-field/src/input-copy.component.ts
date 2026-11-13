import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxIconField } from './icon-field.component';
import { ICON_FIELD_ICON_DEFAULTS } from './icon-field.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { ICON_FIELD_THEME } from './icon-field.theme';

/** Button inside `tx-icon-field` that copies the field value to the clipboard. */
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
      <span class="tx-copy-swap" [class.tx-copy-swap--done]="isCopied()"><tx-icon class="tx-copy-swap__icon tx-copy-swap__icon--idle" name="copy" /><tx-icon class="tx-copy-swap__icon tx-copy-swap__icon--done" name="check" /></span>
    </button>
  `,
  styleUrl: './input-action.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-input-copy' },
  viewProviders: [provideTxIconDefaults(ICON_FIELD_ICON_DEFAULTS)],
})
export class TxInputCopy {
  private readonly iconFieldTheme = injectTokens(ICON_FIELD_THEME);

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
