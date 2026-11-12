import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraTextareaTokens, toStyleObject } from '@tectra-ng/themes';
import { TxTextarea } from './textarea.directive';
import { TxTextareaCounterPart } from './textarea.types';
import { TEXTAREA_THEME } from './textarea.theme';

@Component({
  selector: 'tx-textarea-counter',
  template: `{{ text() }}`,
  styles: `
    :host {
      display: block;
    }

    :host([data-styled]) {
      margin-top: var(--tx-textarea-counter-margin-top);
      color: var(--tx-textarea-counter-color);
      font-family: var(--tx-font-family);
      font-size: var(--tx-textarea-counter-font-size);
      font-variant-numeric: tabular-nums;
      text-align: end;
    }

    :host([data-styled].tx-textarea-counter--limit) {
      color: var(--tx-textarea-counter-limit-color);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-textarea-counter',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-textarea-counter--limit]': 'isAtLimit()',
    'aria-hidden': 'true',
  },
})
export class TxTextareaCounter {
  private readonly textareaTheme = injectTokens(TEXTAREA_THEME);

  readonly for = input.required<TxTextarea>();
  readonly dt = input<TectraDeepPartial<TectraTextareaTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTextareaCounterPart, TxTextareaCounter> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('textareaCounter', this, this.pt, this.ptOptions);
  readonly text = computed(() => {
    const max = this.for().maxLength();
    return max ? `${this.for().length()} / ${max}` : String(this.for().length());
  });
  readonly isAtLimit = computed(() => {
    const max = this.for().maxLength();
    return !!max && this.for().length() >= max;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-textarea'), ...this.passThrough().root?.style }));
}
