import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';

@Component({
  selector: 'skeleton-list-example',
  imports: [TxSkeleton],
  template: `
    <ul class="list">
      @for (row of rows; track row) {
        <li>
          <tx-skeleton shape="circle" size="32px" />
          <tx-skeleton [width]="row" />
          <tx-skeleton width="56px" height="20px" borderRadius="999px" />
        </li>
      }
    </ul>
  `,
  styles: `
    .list {
      display: grid;
      gap: 12px;
      max-width: 420px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonListExample {
  readonly rows = ['70%', '50%', '85%', '60%'];
}
