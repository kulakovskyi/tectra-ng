import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraPillTokens, toStyleObject } from '@tectra-ng/themes';
import { TxPillPart, TxPillSize, TxPillTone, TxPillVariant } from './pill.types';

@Component({
  selector: 'tx-pill',
  imports: [TxIcon],
  template: `
    @if (dot()) {
      <span class="tx-pill__dot" aria-hidden="true"></span>
    } @else if (icon(); as icon) {
      <span class="tx-pill__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
        @if (iconName(); as name) {
          <tx-icon [name]="name" />
        } @else {
          <span [class]="icon"></span>
        }
      </span>
    }
    <ng-content select="[txPillLeading]" />
    <span class="tx-pill__label" [class]="passThrough().label?.class" [style]="passThrough().label?.style">{{ value() }}<ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="tx-pill__remove"
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
  styleUrl: './pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-pill',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-tone]': 'tone()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'resolvedSize()',
  },
})
export class TxPill {
  private txIconRegistry = inject(TxIconRegistry);

  readonly value = input<string | number | undefined>(undefined);
  readonly tone = input<TxPillTone>('neutral');
  readonly variant = input<TxPillVariant>('soft');
  readonly size = input<TxPillSize>('medium');
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly dot = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly removable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly removeLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraPillTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPillPart, TxPill> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly removed = output<Event>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('pill', this, this.pt, this.ptOptions);
  readonly resolvedSize = computed(() => (this.size() === 'normal' ? 'medium' : this.size()));
  readonly iconName = computed(() => {
    const icon = this.icon();
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-pill'), ...this.passThrough().root?.style }));

  remove(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.removed.emit(event);
  }
}
