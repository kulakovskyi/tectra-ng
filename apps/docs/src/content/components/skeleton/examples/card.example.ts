import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSkeleton } from '@tectra/ui/skeleton';

@Component({
  selector: 'skeleton-card-example',
  imports: [TxSkeleton],
  template: `
    <div class="card">
      <div class="head">
        <tx-skeleton shape="circle" size="40px" />
        <div class="who">
          <tx-skeleton width="120px" />
          <tx-skeleton width="80px" height="10px" />
        </div>
      </div>
      <tx-skeleton height="140px" borderRadius="12px" />
      <tx-skeleton [lines]="2" />
    </div>
  `,
  styles: `
    .card {
      display: grid;
      gap: 14px;
      max-width: 360px;
      padding: 16px;
      border: 1px solid var(--tx-surface-border);
      border-radius: 16px;
      background: var(--tx-surface-card);
    }

    .head {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .who {
      display: grid;
      gap: 6px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonCardExample {}
