import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, booleanAttribute, computed, inject, input, numberAttribute, output, signal } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxPlacement } from '@tectra-ng/core/overlay';
import { optionalBoolean, writeToClipboard } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraTruncateTextTokens, toStyleObject } from '@tectra-ng/themes';
import { TxHighlightTerms, TxHighlightText } from '@tectra-ng/ui/highlight-text';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxTruncateTextPart } from './truncate-text.types';
import { TRUNCATE_TEXT_ICON_DEFAULTS } from './truncate-text.icons';
import { TRUNCATE_TEXT_THEME } from './truncate-text.theme';

const COPIED_FOR = 1600;

@Component({
  selector: 'tx-truncate-text',
  imports: [NgTemplateOutlet, TxHighlightText, TxIcon, TxTooltip],
  templateUrl: './truncate-text.component.html',
  styleUrl: './truncate-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-truncate-text',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-truncate-text--truncated]': 'isTruncated()',
  },
  viewProviders: [provideTxIconDefaults(TRUNCATE_TEXT_ICON_DEFAULTS)],
})
export class TxTruncateText {
  private readonly truncateTextTheme = injectTokens(TRUNCATE_TEXT_THEME);

  private document = inject(DOCUMENT);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  readonly text = input<string | number | null | undefined>('');
  readonly limit = input<number, unknown>(15, { transform: numberAttribute });
  readonly ellipsis = input<string>('...');
  readonly href = input<string | null | undefined>(undefined);
  readonly openLink = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly target = input<string>('_blank');
  readonly highlight = input<TxHighlightTerms>('');
  readonly copyable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tooltipPlacement = input<TxPlacement>('top');
  readonly dt = input<TectraDeepPartial<TectraTruncateTextTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTruncateTextPart, TxTruncateText> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly copied = output<string>();
  readonly copyFailed = output<string>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('truncateText', this, this.pt, this.ptOptions);
  readonly isCopied = signal(false);
  readonly isCopyFailed = signal(false);

  readonly fullText = computed(() => String(this.text() ?? ''));
  readonly isTruncated = computed(() => this.limit() >= 0 && Array.from(this.fullText()).length > this.limit());
  readonly displayText = computed(() => (this.isTruncated() ? Array.from(this.fullText()).slice(0, this.limit()).join('') + this.ellipsis() : this.fullText()));
  readonly tooltip = computed(() => (this.isTruncated() ? this.fullText() : null));
  readonly linkHref = computed(() => this.href() || (this.openLink() ? this.fullText() : null) || null);
  readonly relation = computed(() => (this.target() === '_blank' ? 'noopener noreferrer' : null));
  readonly copyLabel = computed(() => {
    const translations = this.translations();
    if (this.isCopied()) return translations.copied;
    return this.isCopyFailed() ? translations.copyToClipboardFailed : translations.copy;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-truncate-text'), ...this.passThrough().root?.style }));

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      if (this.timer) clearTimeout(this.timer);
    });
  }

  async copy(): Promise<boolean> {
    const text = this.fullText();
    const done = await writeToClipboard(text, this.document);
    if (this.destroyed) {
      return done;
    }
    this.isCopied.set(done);
    this.isCopyFailed.set(!done);
    if (done) {
      this.copied.emit(text);
    } else {
      this.copyFailed.emit(text);
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.isCopied.set(false);
      this.isCopyFailed.set(false);
    }, COPIED_FOR);
    return done;
  }
}
