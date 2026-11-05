import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra/ui/menu';
import { TxSpeedDial } from '@tectra/ui/speed-dial';

@Component({
  selector: 'speed-dial-design-tokens-example',
  imports: [TxSpeedDial],
  template: `
    <div class="stage">
      <tx-speed-dial
        direction="right"
        ariaLabel="Format"
        itemSeverity="primary"
        [model]="items"
        [dt]="{ root: { gap: '4px', duration: '0.4s', stagger: '60ms' } }"
      />
    </div>
  `,
  styles: `
    .stage {
      display: flex;
      align-items: center;
      height: 80px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SpeedDialDesignTokensExample {
  readonly items: TxMenuItem[] = [
    { label: 'Bold', icon: 'bold' },
    { label: 'Italic', icon: 'italic' },
    { label: 'Link', icon: 'link' },
  ];
}
