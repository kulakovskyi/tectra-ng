import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, input, numberAttribute, viewChild } from '@angular/core';
import { optionalNumber } from '@tectra-ng/core/utils';
import { injectTokens } from '@tectra-ng/core/config';
import { SPLITTER_THEME } from './splitter.theme';

/** One panel of `tx-splitter`: its content, initial size and limits. */
@Component({
  selector: 'tx-splitter-panel',
  template: '<ng-template #content><ng-content /></ng-template>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxSplitterPanel {
  private readonly splitterTheme = injectTokens(SPLITTER_THEME);

  readonly size = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly minSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly maxSize = input(100, { transform: numberAttribute });
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly collapsedSize = input(0, { transform: numberAttribute });

  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
