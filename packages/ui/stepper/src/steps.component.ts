import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, contentChild, inject, input, model } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraStepsTokens, toStyleObject } from '@tectra-ng/themes';
import { TxStepsItemTemplate } from './stepper.templates';
import { TxStepsItem, TxStepsItemContext, TxStepsPart, TxStepsVariant } from './stepper.types';
import { STEPPER_ICON_DEFAULTS } from './stepper.icons';
import { STEPPER_THEME } from './stepper.theme';

/** Internal view model of one step of `tx-steps`: the item with its state and icon. */
interface TxStepsEntry {
  /** The item behind the entry. */
  item: TxStepsItem;
  /** Position of the entry. */
  index: number;
  /** Whether the entry is the current step. */
  active: boolean;
  /** Whether the entry comes before the current step. */
  done: boolean;
  /** Whether the step can be clicked: not `readonly`, not disabled and has a `command`. */
  clickable: boolean;
  /** Registered icon name, or `null`. */
  icon: string | null;
  /** CSS class used as an icon when the name is not a registered icon, or `null`. */
  iconClass: string | null;
  /** Context given to the `txStepsItem` template. */
  context: TxStepsItemContext;
}

const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];

/** A step indicator built from an `items` array, without panels. */
@Component({
  selector: 'tx-steps',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-steps',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-variant]': 'variant()',
    '[class.tx-steps--readonly]': 'readonly()',
  },
  viewProviders: [provideTxIconDefaults(STEPPER_ICON_DEFAULTS)],
})
export class TxSteps {
  private readonly stepperTheme = injectTokens(STEPPER_THEME);

  private readonly txIconRegistry = injectTxIcons();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly items = input<readonly TxStepsItem[] | null | undefined>([]);
  readonly activeIndex = model<number>(0);
  readonly readonly = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly variant = input<TxStepsVariant>('default');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraStepsTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxStepsPart, TxSteps> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  protected readonly itemTemplate = contentChild(TxStepsItemTemplate);
  protected readonly t = injectTranslations();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('steps', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-steps'), ...this.passThrough().root?.style }));

  protected readonly entries = computed<TxStepsEntry[]>(() => {
    const active = this.activeIndex();
    const readonly = this.readonly();
    return (this.items() ?? []).map((item, index) => {
      const known = !!item.icon && this.txIconRegistry.has(item.icon);
      return {
        item,
        index,
        active: index === active,
        done: index < active,
        clickable: !readonly && !item.disabled && !!item.command,
        icon: known ? (item.icon ?? null) : null,
        iconClass: item.icon && !known ? item.icon : null,
        context: { $implicit: item, index, active: index === active, done: index < active },
      };
    });
  });

  protected select(event: Event, entry: TxStepsEntry): void {
    if (!entry.clickable) {
      return;
    }
    this.activeIndex.set(entry.index);
    entry.item.command?.({ originalEvent: event, item: entry.item, index: entry.index });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const buttons = Array.from(this.host.nativeElement.querySelectorAll<HTMLButtonElement>('button.tx-steps__link'));
    const current = buttons.indexOf(event.target as HTMLButtonElement);
    let target: HTMLButtonElement | undefined;
    if (NEXT_KEYS.includes(event.key)) {
      target = buttons[(current + 1) % buttons.length];
    } else if (PREVIOUS_KEYS.includes(event.key)) {
      target = buttons[(current - 1 + buttons.length) % buttons.length];
    } else if (event.key === 'Home') {
      target = buttons[0];
    } else if (event.key === 'End') {
      target = buttons[buttons.length - 1];
    }
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }
}
