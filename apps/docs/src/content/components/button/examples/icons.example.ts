import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-icons-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [icon]="'plus'">Create</button>
      <button txButton [icon]="'download'" [iconPos]="'right'" [severity]="'secondary'">
        Export
      </button>
      <button txButton [icon]="'upload'" [iconPos]="'top'" [outlined]="true">Upload</button>
      <button txButton [icon]="'bell'" [iconPos]="'bottom'" [text]="true">Alerts</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonIconsExample {}
