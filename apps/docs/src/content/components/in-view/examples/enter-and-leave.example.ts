import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxScrollPanel } from '@tectra-ng/ui/scroll-panel';
import { TxTag } from '@tectra-ng/ui/tag';
import { TxInView } from '@tectra-ng/utils/in-view';

@Component({
  selector: 'in-view-enter-and-leave-example',
  imports: [TxScrollPanel, TxTag, TxInView],
  template: `
    <div class="stack wide">
      <div class="flex">
        <tx-tag
          [value]="target.isInView() ? 'In view' : 'Out of view'"
          [severity]="target.isInView() ? 'success' : 'secondary'"
        />
        <span class="hint">Entered {{ entries() }} times</span>
      </div>
      <tx-scroll-panel class="box">
        <div class="track">
          <div
            class="target"
            txInView
            #target="txInView"
            [once]="false"
            [threshold]="0.5"
            (entered)="entries.update((count) => count + 1)"
          >
            Target
          </div>
        </div>
      </tx-scroll-panel>
    </div>
  `,
  styles: `
    .wide {
      max-width: none;
    }
    .box {
      height: 160px;
      border: 1px solid var(--tx-surface-border);
      border-radius: calc(var(--tx-radius-md) + 12px);
    }
    .track {
      padding: 220px 12px;
    }
    .target {
      padding: 24px;
      border-radius: var(--tx-radius-md);
      background: var(--tx-surface-hover);
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InViewEnterAndLeaveExample {
  readonly entries = signal(0);
}
