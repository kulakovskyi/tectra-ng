import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxTooltip } from '@tectra/ui/tooltip';

@Component({
  selector: 'tooltip-icon-buttons-example',
  imports: [TxTooltip, TxButton],
  template: `
    <div class="toolbar">
      <button txButton icon="pencil" severity="secondary" [text]="true" txTooltip="Edit"></button>
      <button
        txButton
        icon="copy"
        severity="secondary"
        [text]="true"
        txTooltip="Duplicate"
      ></button>
      <button
        txButton
        icon="download"
        severity="secondary"
        [text]="true"
        txTooltip="Download as PDF"
      ></button>
      <button txButton icon="trash" severity="danger" [text]="true" txTooltip="Delete"></button>
    </div>
  `,
  styles: `
    .toolbar {
      display: flex;
      gap: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipIconButtonsExample {}
