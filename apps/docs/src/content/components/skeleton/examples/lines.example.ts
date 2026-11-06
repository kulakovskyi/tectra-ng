import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';

@Component({
  selector: 'skeleton-lines-example',
  imports: [TxSkeleton],
  template: `<tx-skeleton [lines]="4" />`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonLinesExample {}
