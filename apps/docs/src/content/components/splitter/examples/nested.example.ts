import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSplitter, TxSplitterPanel } from '@tectra-ng/ui/splitter';

@Component({
  selector: 'splitter-nested-example',
  imports: [TxSplitter, TxSplitterPanel],
  template: `
    <tx-splitter class="split">
      <tx-splitter-panel [size]="25" [minSize]="15"
        ><div class="pane">Files</div></tx-splitter-panel
      >
      <tx-splitter-panel [size]="75">
        <tx-splitter layout="vertical">
          <tx-splitter-panel [size]="65"><div class="pane">Editor</div></tx-splitter-panel>
          <tx-splitter-panel [size]="35">
            <tx-splitter>
              <tx-splitter-panel><div class="pane">Output</div></tx-splitter-panel>
              <tx-splitter-panel><div class="pane">Problems</div></tx-splitter-panel>
            </tx-splitter>
          </tx-splitter-panel>
        </tx-splitter>
      </tx-splitter-panel>
    </tx-splitter>
  `,
  styles: `
    .split {
      height: 320px;
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
export default class SplitterNestedExample {}
