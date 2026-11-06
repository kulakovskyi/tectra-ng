import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';

@Component({
  selector: 'skeleton-no-animation-example',
  imports: [TxSkeleton],
  template: `<tx-skeleton [lines]="3" animation="none" />`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonNoAnimationExample {}
