import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-plain-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [plain]="true" [text]="true" [icon]="'filter'">Filter</button>
      <button txButton [plain]="true" [text]="true" [icon]="'download'">Export</button>
      <button txButton [plain]="true" [outlined]="true" [icon]="'refresh'">Refresh</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonPlainExample {}
