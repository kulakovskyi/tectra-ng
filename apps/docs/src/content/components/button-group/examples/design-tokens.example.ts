import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-design-tokens-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <div class="stack">
      <tx-button-group
        aria-label="Wide divider"
        [dt]="{ root: { dividerColor: 'var(--tx-surface-0)', dividerWidth: '2px' } }"
      >
        <button txButton [icon]="'download'">Export</button>
        <button txButton [icon]="'print'">Print</button>
        <button txButton [icon]="'share-alt'">Share</button>
      </tx-button-group>
      <tx-button-group aria-label="No divider" [dt]="{ root: { dividerColor: 'transparent' } }">
        <button txButton [icon]="'download'">Export</button>
        <button txButton [icon]="'print'">Print</button>
        <button txButton [icon]="'share-alt'">Share</button>
      </tx-button-group>
    </div>
  `,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupDesignTokensExample {}
