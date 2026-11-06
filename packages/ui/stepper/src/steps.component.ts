import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, contentChild, inject, input, model } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIcon, TxIconRegistry } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraStepsTokens, toStyleObject } from '@tectra-ng/themes';
import { TxStepsItemTemplate } from './stepper.templates';
import { TxStepsItem, TxStepsItemContext, TxStepsPart, TxStepsVariant } from './stepper.types';

interface TxStepsEntry {
  item: TxStepsItem;
  index: number;
  active: boolean;
  done: boolean;
  clickable: boolean;
  icon: string | null;
  iconClass: string | null;
  context: TxStepsItemContext;
}

const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];

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
})
export class TxSteps {
  private readonly txIconRegistry = inject(TxIconRegistry);
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
