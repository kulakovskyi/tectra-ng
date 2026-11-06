import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';

@Component({
  selector: 'skeleton-design-tokens-example',
  imports: [TxSkeleton],
  template: `<tx-skeleton
    [lines]="3"
    [dt]="{
      root: { lineHeight: '18px', lineGap: '14px', borderRadius: '999px', duration: '2.4s' },
    }"
  />`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonDesignTokensExample {}
