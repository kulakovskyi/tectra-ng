import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra/icons';
import { TectraChipTokens, TectraDeepPartial, toStyleObject } from '@tectra/themes';
import { TxChipPart } from './chip.types';

@Component({
  selector: 'tx-chip',
  imports: [TxIcon],
  template: `
    @if (image(); as image) {
      <img class="tx-chip__image" [src]="image" [alt]="alt() ?? ''" [class]="passThrough().image?.class" [style]="passThrough().image?.style" />
    } @else if (icon(); as icon) {
      <span class="tx-chip__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
        @if (registered(icon); as name) {
          <tx-icon [name]="name" />
        } @else {
          <span [class]="icon"></span>
        }
      </span>
    }
    <span class="tx-chip__label" [class]="passThrough().label?.class" [style]="passThrough().label?.style">{{ label() }}<ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="tx-chip__remove"
        [class]="passThrough().remove?.class"
        [style]="passThrough().remove?.style"
        [attr.aria-label]="removeLabel() ?? translations().remove"
        [title]="removeLabel() ?? translations().remove"
        (click)="remove($event)"
        (keydown.delete)="remove($event)"
        (keydown.backspace)="remove($event)"
      >
        @if (registered(removeIcon()); as name) {
          <tx-icon [name]="name" />
        } @else {
          <span [class]="removeIcon()"></span>
        }
      </button>
    }
  `,
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-chip',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-chip--image]': '!!image()',
    '[class.tx-chip--removable]': 'removable()',
  },
})
export class TxChip {
  private txIconRegistry = inject(TxIconRegistry);

  readonly label = input<string | undefined>(undefined);
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly image = input<string | undefined>(undefined);
  readonly alt = input<string | undefined>(undefined);
  readonly removable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly removeIcon = input<TxIconName | (string & {})>('times-circle');
  readonly removeLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraChipTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxChipPart, TxChip> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly removed = output<Event>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('chip', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-chip'), ...this.passThrough().root?.style }));

  registered(icon: string): string | null {
    return this.txIconRegistry.has(icon) ? icon : null;
  }

  remove(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.removed.emit(event);
  }
}
