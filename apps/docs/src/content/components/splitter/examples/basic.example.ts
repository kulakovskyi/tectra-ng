import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSplitter, TxSplitterPanel } from '@tectra-ng/ui/splitter';

@Component({
  selector: 'splitter-basic-example',
  imports: [TxSplitter, TxSplitterPanel],
  template: `
    <tx-splitter class="split">
      <tx-splitter-panel><div class="pane">Navigation</div></tx-splitter-panel>
      <tx-splitter-panel><div class="pane">Content</div></tx-splitter-panel>
    </tx-splitter>
  `,
  styles: `
    .split {
      height: 240px;
    }

    .pane {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitterBasicExample {}
