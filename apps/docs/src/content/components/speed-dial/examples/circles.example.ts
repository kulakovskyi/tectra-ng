import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSpeedDial } from '@tectra-ng/ui/speed-dial';

@Component({
  selector: 'speed-dial-circles-example',
  imports: [TxSpeedDial],
  template: `
    <div class="stage">
      <div class="cell center">
        <tx-speed-dial type="circle" ariaLabel="Circle" [radius]="80" [model]="items" />
      </div>
      <div class="cell bottom">
        <tx-speed-dial
          type="semi-circle"
          direction="up"
          ariaLabel="Semi-circle"
          [radius]="80"
          [model]="items"
        />
      </div>
      <div class="cell corner">
        <tx-speed-dial
          type="quarter-circle"
          direction="up-left"
          ariaLabel="Quarter-circle"
          [radius]="100"
          [model]="items"
        />
      </div>
    </div>
  `,
  styles: `
    .stage {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 24px;
    }
    .cell {
      display: flex;
      height: 220px;
    }
    .center {
      align-items: center;
      justify-content: center;
    }
    .bottom {
      align-items: flex-end;
      justify-content: center;
    }
    .corner {
      align-items: flex-end;
      justify-content: flex-end;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SpeedDialCirclesExample {
  readonly items: TxMenuItem[] = [
    { label: 'Mail', icon: 'envelope' },
    { label: 'Call', icon: 'phone' },
    { label: 'Video', icon: 'video' },
    { label: 'Photo', icon: 'camera' },
  ];
}
