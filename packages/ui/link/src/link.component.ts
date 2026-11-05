import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra/core/utils';
import { TxIcon } from '@tectra/icons';
import { TectraDeepPartial, TectraLinkTokens, toStyleObject } from '@tectra/themes';
import { TxHighlightTerms, TxHighlightText } from '@tectra/ui/highlight-text';
import { TxLinkCommands, TxLinkPart, TxLinkType } from './link.types';

const COPIED_FOR = 1600;
const PROTOCOL = /^[a-z][a-z\d+.-]*:/i;

@Component({
  selector: 'tx-link',
  imports: [NgTemplateOutlet, RouterLink, TxIcon, TxHighlightText],
  templateUrl: './link.component.html',
  styleUrl: './link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-link',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-type]': 'type()',
  },
})
export class TxLink {
  private document = inject(DOCUMENT);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly link = input<string | null | undefined>('');
  readonly type = input<TxLinkType>('url');
  readonly linkText = input<string | null | undefined>(undefined);
  readonly highlight = input<TxHighlightTerms>('');
  readonly maxLength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly routerLink = input<TxLinkCommands>(undefined);
  readonly target = input<string | undefined>(undefined);
  readonly external = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly copyable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraLinkTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxLinkPart, TxLink> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly copied = output<string>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('link', this, this.pt, this.ptOptions);
  readonly isCopied = signal(false);

  readonly value = computed(() => (this.link() ?? '').trim());
  readonly fullText = computed(() => this.linkText() || this.value());
  readonly isTruncated = computed(() => {
    const max = this.maxLength();
    return max !== undefined && max > 0 && this.fullText().length > max;
  });
  readonly displayText = computed(() => (this.isTruncated() ? `${this.fullText().slice(0, this.maxLength()).trimEnd()}…` : this.fullText()));
  readonly fullTitle = computed(() => (this.isTruncated() ? this.fullText() : null));
  readonly href = computed(() => {
    const value = this.value();
    switch (this.type()) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value.replace(/[^\d+]/g, '')}`;
      default:
        return PROTOCOL.test(value) || value.startsWith('/') ? value : `https://${value}`;
    }
  });
  readonly resolvedTarget = computed(() => this.target() ?? (this.type() === 'url' ? '_blank' : null));
  readonly opensNewTab = computed(() => !this.routerLink() && this.resolvedTarget() === '_blank');
  readonly showExternal = computed(() => this.external() ?? this.opensNewTab());
  readonly copyLabel = computed(() => {
    const translations = this.translations();
    return { url: translations.copyLink, email: translations.copyEmail, phone: translations.copyPhone }[this.type()];
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-link'), ...this.passThrough().root?.style }));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timer && clearTimeout(this.timer));
  }

  copy(): void {
    const text = this.value();
    this.document.defaultView?.navigator.clipboard?.writeText(text);
    this.copied.emit(text);
    this.isCopied.set(true);
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.isCopied.set(false), COPIED_FOR);
  }
}
