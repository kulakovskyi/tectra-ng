import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTruncateText } from '@tectra-ng/ui/truncate-text';

@Component({
  selector: 'truncate-text-pass-through-example',
  imports: [TxTruncateText],
  template: `<tx-truncate-text
    text="9f2c41d7-6b0e-4c55-9a43-0d2e7b8c1f60"
    [limit]="12"
    copyable
    [pt]="pt"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TruncateTextPassThroughExample {
  readonly pt = {
    text: { style: { fontFamily: 'var(--tx-font-mono)' } },
    copy: { style: { opacity: '0.7' } },
  };
}
