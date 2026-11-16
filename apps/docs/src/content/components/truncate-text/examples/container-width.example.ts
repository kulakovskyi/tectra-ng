import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTruncateText } from '@tectra-ng/ui/truncate-text';

@Component({
  selector: 'truncate-text-container-width-example',
  imports: [TxTruncateText],
  template: `
    <div class="box">
      <tx-truncate-text
        text="Quarterly marketing report for the spring campaign, final version"
        [limit]="60"
        copyable
      />
    </div>
  `,
  styles: `
    .box {
      width: 220px;
      max-width: 100%;
      padding: 8px 12px;
      border: 1px dashed var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TruncateTextContainerWidthExample {}
