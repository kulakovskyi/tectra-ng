import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, computed, inject, output, signal } from '@angular/core';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { writeToClipboard } from '@tectra-ng/core/utils';
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
      [attr.aria-label]="label()"
      [title]="label()"
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
  private document = inject(DOCUMENT);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  readonly translations = injectTranslations();
  readonly isCopied = signal(false);
  readonly isCopyFailed = signal(false);
  readonly label = computed(() => {
    const translations = this.translations();
    if (this.isCopied()) return translations.copied;
    return this.isCopyFailed() ? translations.copyToClipboardFailed : translations.copy;
  });

  readonly copied = output<string>();
  readonly copyFailed = output<string>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      if (this.timer) clearTimeout(this.timer);
    });
  }

  async copy(): Promise<boolean> {
    const value = this.field.value();
    const done = await writeToClipboard(value, this.document);
    if (this.destroyed) {
      return done;
    }
    this.isCopied.set(done);
    this.isCopyFailed.set(!done);
    if (done) {
      this.copied.emit(value);
    } else {
      this.copyFailed.emit(value);
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.isCopied.set(false);
      this.isCopyFailed.set(false);
    }, 1500);
    return done;
  }
}
