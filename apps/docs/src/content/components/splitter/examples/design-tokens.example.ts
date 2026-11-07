import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSplitter, TxSplitterPanel } from '@tectra-ng/ui/splitter';

@Component({
  selector: 'splitter-design-tokens-example',
  imports: [TxSplitter, TxSplitterPanel],
  template: `
    <tx-splitter
      class="split"
      [gutterSize]="8"
      [dt]="{
        gutter: { background: 'var(--tx-surface-ground)' },
        handle: { background: 'var(--tx-surface-400)', borderRadius: 'var(--tx-radius-full)' },
      }"
    >
      <tx-splitter-panel><div class="pane">Original</div></tx-splitter-panel>
      <tx-splitter-panel><div class="pane">Changed</div></tx-splitter-panel>
    </tx-splitter>
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitterDesignTokensExample {}
