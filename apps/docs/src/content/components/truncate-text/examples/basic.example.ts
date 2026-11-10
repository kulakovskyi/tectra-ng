import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTruncateText } from '@tectra-ng/ui/truncate-text';

@Component({
  selector: 'truncate-text-basic-example',
  imports: [TxTruncateText],
  template: `
    <div class="rows">
      <tx-truncate-text text="Quarterly marketing report for the spring campaign" [limit]="24" />
      <tx-truncate-text text="Short title" [limit]="24" />
      <tx-truncate-text text="9f2c41d7-6b0e-4c55-9a43-0d2e7b8c1f60" [limit]="8" ellipsis="…" />
    </div>
  `,
  styles: `
    .rows {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TruncateTextBasicExample {}
