import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, ElementRef, booleanAttribute, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraTagTokens, toStyleObject } from '@tectra-ng/themes';
import { TxTagPart, TxTagSeverity, TxTagSize } from './tag.types';
import { TAG_ICON_DEFAULTS } from './tag.icons';

const COPIED_FOR = 1500;

@Component({
  selector: 'tx-tag',
  imports: [TxIcon],
  template: `
    @if (icon(); as icon) {
      <span class="tx-tag__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
        @if (iconName(); as name) {
          <tx-icon [name]="name" />
        } @else {
          <span [class]="icon"></span>
        }
      </span>
    }
    <span #label class="tx-tag__label" [class]="passThrough().label?.class" [style]="passThrough().label?.style">{{ value() }}<ng-content /></span>
    @if (copyable()) {
      <button
        type="button"
        class="tx-tag__action tx-tag__copy"
        [class.tx-tag__copy--done]="isCopied()"
        [class]="passThrough().copy?.class"
        [style]="passThrough().copy?.style"
        [attr.aria-label]="isCopied() ? translations().copied : translations().copy"
        [title]="isCopied() ? translations().copied : translations().copy"
        (click)="copy()"
      >
        <span class="tx-copy-swap" [class.tx-copy-swap--done]="isCopied()"><tx-icon class="tx-copy-swap__icon tx-copy-swap__icon--idle" name="copy" /><tx-icon class="tx-copy-swap__icon tx-copy-swap__icon--done" name="check" /></span>
      </button>
    }
    @if (removable()) {
      <button
        type="button"
        class="tx-tag__action tx-tag__remove"
        [class]="passThrough().remove?.class"
        [style]="passThrough().remove?.style"
        [attr.aria-label]="removeLabel() ?? translations().remove"
        [title]="removeLabel() ?? translations().remove"
        (click)="remove($event)"
        (keydown.delete)="remove($event)"
        (keydown.backspace)="remove($event)"
      >
        <tx-icon [name]="'times'" />
      </button>
    }
  `,
  styleUrl: './tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-tag',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-severity]': 'severity()',
    '[attr.data-size]': 'resolvedSize()',
    '[class.tx-tag--rounded]': 'rounded()',
  },
  viewProviders: [provideTxIconDefaults(TAG_ICON_DEFAULTS)],
})
export class TxTag {
  private txIconRegistry = injectTxIcons();
  private document = inject(DOCUMENT);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly value = input<string | number | undefined>(undefined);
  readonly severity = input<TxTagSeverity>('primary');
  readonly size = input<TxTagSize>('medium');
  readonly rounded = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly copyable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly removable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly removeLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraTagTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTagPart, TxTag> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly copied = output<string>();
  readonly removed = output<Event>();

  readonly label = viewChild.required<ElementRef<HTMLElement>>('label');

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('tag', this, this.pt, this.ptOptions);
  readonly isCopied = signal(false);
  readonly resolvedSize = computed(() => (this.size() === 'normal' ? 'medium' : this.size()));
  readonly iconName = computed(() => {
    const icon = this.icon();
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-tag'), ...this.passThrough().root?.style }));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timer && clearTimeout(this.timer));
  }

  copy(): void {
    const text = (this.label().nativeElement.textContent ?? '').trim();
    this.document.defaultView?.navigator.clipboard?.writeText(text);
    this.copied.emit(text);
    this.isCopied.set(true);
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.isCopied.set(false), COPIED_FOR);
  }

  remove(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.removed.emit(event);
  }
}
