import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSplitter, TxSplitterPanel } from '@tectra-ng/ui/splitter';

@Component({
  selector: 'splitter-vertical-example',
  imports: [TxSplitter, TxSplitterPanel],
  template: `
    <tx-splitter class="split" layout="vertical">
      <tx-splitter-panel><div class="pane">Header</div></tx-splitter-panel>
      <tx-splitter-panel><div class="pane">Body</div></tx-splitter-panel>
      <tx-splitter-panel><div class="pane">Footer</div></tx-splitter-panel>
    </tx-splitter>
  `,
  styles: `
    .split {
      height: 300px;
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
export default class SplitterVerticalExample {}
