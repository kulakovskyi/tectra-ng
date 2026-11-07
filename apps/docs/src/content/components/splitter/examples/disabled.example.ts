import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSplitter, TxSplitterPanel } from '@tectra-ng/ui/splitter';

@Component({
  selector: 'splitter-disabled-example',
  imports: [TxSplitter, TxSplitterPanel, TxButton],
  template: `
    <tx-splitter class="split" [disabled]="locked()">
      <tx-splitter-panel [size]="35"><div class="pane">Filters</div></tx-splitter-panel>
      <tx-splitter-panel [size]="65"><div class="pane">Results</div></tx-splitter-panel>
    </tx-splitter>
    <button
      txButton
      class="toggle"
      size="small"
      severity="secondary"
      [icon]="locked() ? 'lock-open' : 'lock'"
      (click)="locked.set(!locked())"
    >
      {{ locked() ? 'Unlock' : 'Lock' }} layout
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

    .toggle {
      margin-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitterDisabledExample {
  readonly locked = signal(true);
}
