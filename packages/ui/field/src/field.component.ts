import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterEveryRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { linkDescribedBy, uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, TxValidationMessages, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TX_FIELD_STATE } from '@tectra/core/forms';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraDeepPartial, TectraFieldTokens, toStyleObject } from '@tectra/themes';
import { TxLabel } from '@tectra/ui/label';
import { TxFieldError, TxFieldHint } from '@tectra/ui/message';
import { TxFieldLayout, TxFieldPart } from './field.types';

const CONTROL_SELECTOR = [
  'input:not([type="hidden"])',
  'textarea',
  'select',
  '[role="combobox"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[contenteditable="true"]',
].join(', ');

@Component({
  selector: 'tx-field',
  imports: [TxLabel, TxFieldHint, TxFieldError],
  templateUrl: './field.component.html',
  styleUrl: './field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_FIELD_STATE, useFactory: () => inject(TxField).state }],
  host: {
    class: 'tx-field',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-layout]': 'layout()',
  },
})
export class TxField {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private generatedId = uniqueId('tx-field');
  private linkedElement: HTMLElement | null = null;
  private linkedKey = '';
  private unlinks: (() => void)[] = [];

  readonly label = input<string | undefined>(undefined);
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly colon = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly subtle = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tooltip = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);
  readonly control = input<AbstractControl | undefined>(undefined);
  readonly errorText = input<string | undefined>(undefined);
  readonly successText = input<string | undefined>(undefined);
  readonly messages = input<TxValidationMessages | undefined>(undefined);
  readonly showImmediately = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly layout = input<TxFieldLayout>('vertical');
  readonly dt = input<TectraDeepPartial<TectraFieldTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxFieldPart, TxField> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly projectedControl = contentChild(NgControl, { descendants: true });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('field', this, this.pt, this.ptOptions);
  readonly labelId = `${this.generatedId}-label`;
  readonly hintId = `${this.generatedId}-hint`;
  readonly errorId = `${this.generatedId}-error`;
  readonly controlId = signal<string | null>(null);
  readonly formControl = computed(() => this.control() ?? this.projectedControl()?.control ?? undefined);
  readonly state = { invalid: computed(() => !!this.errorText()) };
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-field'), ...this.passThrough().root?.style }));

  constructor() {
    afterEveryRender(() => this.linkControl());
    inject(DestroyRef).onDestroy(() => this.unlink());
  }

  private linkControl(): void {
    const host = this.elementRef.nativeElement;
    const group = host.querySelector<HTMLElement>('.tx-field__control :is([role="radiogroup"], [role="group"])');
    const element = group ?? host.querySelector<HTMLElement>(`.tx-field__control :is(${CONTROL_SELECTOR})`);
    const describedBy = [host.querySelector(`#${this.hintId}`) ? this.hintId : null, this.errorId].filter((id): id is string => !!id);
    const key = `${describedBy.join(' ')}|${this.label() ? 'label' : ''}`;
    if (element === this.linkedElement && key === this.linkedKey) {
      return;
    }
    this.unlink();
    this.linkedElement = element;
    this.linkedKey = key;
    if (!element) {
      this.controlId.set(null);
      return;
    }
    this.unlinks = describedBy.map((id) => linkDescribedBy(element, id));
    if (group || !isLabelable(element)) {
      if (this.label() && !element.hasAttribute('aria-labelledby') && !element.hasAttribute('aria-label')) {
        element.setAttribute('aria-labelledby', this.labelId);
        this.unlinks.push(() => element.removeAttribute('aria-labelledby'));
      }
      this.controlId.set(null);
      return;
    }
    if (!element.id) {
      element.id = `${this.generatedId}-control`;
    }
    this.controlId.set(element.id);
  }

  private unlink(): void {
    this.unlinks.forEach((unlink) => unlink());
    this.unlinks = [];
  }
}

function isLabelable(element: HTMLElement): boolean {
  return ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'METER', 'OUTPUT', 'PROGRESS'].includes(element.tagName);
}
