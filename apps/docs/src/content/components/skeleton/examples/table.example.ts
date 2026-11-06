import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSkeletonTable } from '@tectra-ng/ui/skeleton';

@Component({
  selector: 'skeleton-table-example',
  imports: [TxSkeletonTable],
  template: `<tx-skeleton-table [rows]="5" [columns]="4" />`,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonTableExample {}
