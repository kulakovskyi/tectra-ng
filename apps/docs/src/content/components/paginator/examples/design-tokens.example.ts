import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator } from '@tectra-ng/ui/paginator';

@Component({
  selector: 'paginator-design-tokens-example',
  imports: [TxPaginator],
  template: `<tx-paginator [(first)]="first" [rows]="10" [totalRecords]="120" [dt]="tokens" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorDesignTokensExample {
  readonly first = signal(0);
  readonly tokens = {
    navButton: {
      borderRadius: '50%',
      selectedBackground: 'var(--tx-contrast-base)',
      selectedColor: 'var(--tx-contrast-contrast)',
    },
  };
}
