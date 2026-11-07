import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSplitter, TxSplitterPanel } from '@tectra-ng/ui/splitter';

@Component({
  selector: 'splitter-collapsible-example',
  imports: [TxSplitter, TxSplitterPanel],
  template: `
    <tx-splitter class="split" (collapsedChange)="collapsed.set($event.collapsed)">
      <tx-splitter-panel [size]="30" [minSize]="20" collapsible>
        <div class="pane">Sidebar</div>
      </tx-splitter-panel>
      <tx-splitter-panel [size]="70"><div class="pane">Content</div></tx-splitter-panel>
    </tx-splitter>
    <p class="note">Sidebar is {{ collapsed() ? 'collapsed' : 'open' }}</p>
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
export default class SplitterCollapsibleExample {
  readonly collapsed = signal(false);
}
