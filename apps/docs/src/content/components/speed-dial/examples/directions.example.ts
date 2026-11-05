import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra/ui/menu';
import { TxSpeedDial, TxSpeedDialDirection } from '@tectra/ui/speed-dial';

@Component({
  selector: 'speed-dial-directions-example',
  imports: [TxSpeedDial],
  template: `
    <div class="stage">
      @for (direction of directions; track direction.value) {
        <tx-speed-dial
          size="small"
          [class]="direction.value"
          [direction]="direction.value"
          [ariaLabel]="'Actions, opens ' + direction.value"
          [model]="items"
        />
      }
    </div>
  `,
  styles: `
    .stage {
      position: relative;
      height: 260px;
    }
    .stage > * {
      position: absolute;
    }
    .up {
      bottom: 0;
      left: calc(50% - 16px);
    }
    .down {
      top: 0;
      left: calc(50% - 16px);
    }
    .left {
      top: calc(50% - 16px);
      right: 0;
    }
    .right {
      top: calc(50% - 16px);
      left: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SpeedDialDirectionsExample {
  readonly directions: { value: TxSpeedDialDirection }[] = [
    { value: 'up' },
    { value: 'down' },
    { value: 'left' },
    { value: 'right' },
  ];
  readonly items: TxMenuItem[] = [
    { label: 'Copy', icon: 'copy' },
    { label: 'Share', icon: 'share-alt' },
    { label: 'Delete', icon: 'trash', severity: 'danger' },
  ];
}
