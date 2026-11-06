import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';

@Component({
  selector: 'skeleton-loading-example',
  imports: [TxSkeleton, TxButton],
  template: `
    <div class="box" [attr.aria-busy]="loading()">
      @if (loading()) {
        <tx-skeleton width="50%" height="20px" />
        <tx-skeleton [lines]="3" />
      } @else {
        <h4>Quarterly report</h4>
        <p>
          Revenue grew 18% over the last quarter, with most of the growth coming from new teams on
          the yearly plan.
        </p>
      }
    </div>
    <button txButton size="small" severity="secondary" [outlined]="true" (click)="reload()">
      Reload
    </button>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: start;
      gap: 12px;
      max-width: 420px;
    }

    .box {
      display: grid;
      gap: 12px;
      width: 100%;
      min-height: 108px;
    }

    h4,
    p {
      margin: 0;
    }

    p {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonLoadingExample {
  readonly loading = signal(false);

  reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }
}
