import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra/ui/menu';
import { TxSpeedDial } from '@tectra/ui/speed-dial';

@Component({
  selector: 'speed-dial-mask-example',
  imports: [TxSpeedDial],
  template: `
    <div class="stage">
      <tx-speed-dial ariaLabel="Add" mask hideIcon="times" severity="contrast" [model]="items" />
    </div>
  `,
  styles: `
    .stage {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      height: 220px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SpeedDialMaskExample {
  readonly items: TxMenuItem[] = [
    { label: 'Upload', icon: 'upload' },
    { label: 'New folder', icon: 'folder' },
    { label: 'New file', icon: 'file' },
  ];
}
