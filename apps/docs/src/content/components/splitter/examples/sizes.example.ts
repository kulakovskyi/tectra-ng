import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSplitter, TxSplitterPanel, TxSplitterResizeEvent } from '@tectra-ng/ui/splitter';

@Component({
  selector: 'splitter-sizes-example',
  imports: [TxSplitter, TxSplitterPanel, DecimalPipe],
  template: `
    <tx-splitter class="split" (resizing)="sizes.set($event.sizes)">
      <tx-splitter-panel [size]="30" [minSize]="20" [maxSize]="50">
        <div class="pane">20–50%</div>
      </tx-splitter-panel>
      <tx-splitter-panel [size]="70" [minSize]="40">
        <div class="pane">At least 40%</div>
      </tx-splitter-panel>
    </tx-splitter>
    <p class="note">
      Sizes: {{ sizes()[0] | number: '1.0-0' }}% / {{ sizes()[1] | number: '1.0-0' }}%
    </p>
  `,
  styles: `
    .split {
      height: 200px;
    }

    .pane {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .note {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitterSizesExample {
  readonly sizes = signal<TxSplitterResizeEvent['sizes']>([30, 70]);
}
