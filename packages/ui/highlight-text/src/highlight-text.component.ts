import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraDeepPartial, TectraHighlightTextTokens, toStyleObject } from '@tectra/themes';
import { highlightParts } from './highlight-parts';
import { TxHighlightTerms, TxHighlightTextPart } from './highlight-text.types';

@Component({
  selector: 'tx-highlight-text',
  template: `@for (part of parts(); track $index) {
    @if (part.match) {
      <mark class="tx-highlight-text__mark" [class]="passThrough().mark?.class" [style]="passThrough().mark?.style">{{ part.text }}</mark>
    } @else {
      <ng-container>{{ part.text }}</ng-container>
    }
  }`,
  styleUrl: './highlight-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-highlight-text',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxHighlightText {
  readonly text = input<string | number | null | undefined>('');
  readonly highlight = input<TxHighlightTerms>('');
  readonly caseSensitive = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraHighlightTextTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxHighlightTextPart, TxHighlightText> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('highlightText', this, this.pt, this.ptOptions);
  readonly parts = computed(() => highlightParts(String(this.text() ?? ''), this.highlight(), { caseSensitive: this.caseSensitive() }));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-highlight-text'), ...this.passThrough().root?.style }));
}
