import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSkeleton } from '@tectra/ui/skeleton';

@Component({
  selector: 'skeleton-shapes-example',
  imports: [TxSkeleton],
  template: `
    <div class="row">
      <tx-skeleton shape="circle" size="56px" />
      <tx-skeleton width="140px" height="56px" />
      <tx-skeleton width="56px" height="56px" borderRadius="14px" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonShapesExample {}
