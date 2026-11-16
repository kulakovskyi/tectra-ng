import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-variants-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <div class="stack">
      <tx-button-group aria-label="Edit, solid">
        <button txButton [icon]="'copy'">Copy</button>
        <button txButton [icon]="'clone'">Duplicate</button>
        <button txButton [icon]="'eraser'">Clear</button>
      </tx-button-group>
      <tx-button-group aria-label="Edit, outlined">
        <button txButton [outlined]="true" [icon]="'copy'">Copy</button>
        <button txButton [outlined]="true" [icon]="'clone'">Duplicate</button>
        <button txButton [outlined]="true" [icon]="'eraser'">Clear</button>
      </tx-button-group>
      <tx-button-group aria-label="Edit, plain">
        <button txButton [outlined]="true" [plain]="true" [icon]="'copy'">Copy</button>
        <button txButton [outlined]="true" [plain]="true" [icon]="'clone'">Duplicate</button>
        <button txButton [outlined]="true" [plain]="true" [icon]="'eraser'">Clear</button>
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
export default class ButtonGroupVariantsExample {}
