import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSplitter, TxSplitterPanel } from '@tectra-ng/ui/splitter';

const STATE_KEY = 'docs-splitter-state';

@Component({
  selector: 'splitter-stateful-example',
  imports: [TxSplitter, TxSplitterPanel, TxButton],
  template: `
    <tx-splitter class="split" [stateKey]="stateKey" stateStorage="local">
      <tx-splitter-panel [size]="40"><div class="pane">Resize me</div></tx-splitter-panel>
      <tx-splitter-panel [size]="60"><div class="pane">and reload the page</div></tx-splitter-panel>
    </tx-splitter>
    <button
      txButton
      class="reset"
      size="small"
      severity="secondary"
      icon="refresh"
      (click)="reset()"
    >
      Reset sizes
    </button>
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

    .reset {
      margin-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitterStatefulExample {
  readonly stateKey = STATE_KEY;
  private readonly splitter = viewChild.required(TxSplitter);

  reset(): void {
    try {
      localStorage.removeItem(STATE_KEY);
    } finally {
      this.splitter().resetState();
    }
  }
}
