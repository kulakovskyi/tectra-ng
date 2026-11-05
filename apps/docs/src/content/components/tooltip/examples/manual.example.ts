import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxTooltip } from '@tectra/ui/tooltip';

@Component({
  selector: 'tooltip-manual-example',
  imports: [TxTooltip, TxButton],
  template: `
    <div class="row">
      <code>https://example.com/invite/7Q2M</code>
      <button
        txButton
        icon="copy"
        severity="secondary"
        [outlined]="true"
        aria-label="Copy link"
        txTooltip="Copied"
        tooltipEvent="manual"
        [tooltipLife]="1500"
        #copied="txTooltip"
        (click)="copy(); copied.show()"
      ></button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipManualExample {
  copy(): void {
    void navigator.clipboard?.writeText('https://example.com/invite/7Q2M').catch(() => undefined);
  }
}
