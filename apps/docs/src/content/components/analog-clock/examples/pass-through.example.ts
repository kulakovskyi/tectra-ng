import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAnalogClock } from '@tectra-ng/ui/analog-clock';

@Component({
  selector: 'analog-clock-pass-through-example',
  imports: [TxAnalogClock],
  template: `<tx-analog-clock ariaLabel="Square face" [pt]="pt" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalogClockPassThroughExample {
  readonly pt = {
    face: { style: { borderRadius: '28px' } },
    pin: { style: { width: '10px', height: '10px' } },
  };
}
