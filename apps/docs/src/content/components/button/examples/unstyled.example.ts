import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-unstyled-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [unstyled]="true" [icon]="'check'" class="my-button">My own styles</button>
      <button txButton [unstyled]="true">Browser default</button>
    </div>
  `,
  styles: `
    .my-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border: 2px dashed currentColor;
      border-radius: 0;
      background: none;
      color: var(--tx-help-base);
      font: 600 14px monospace;
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonUnstyledExample {}
