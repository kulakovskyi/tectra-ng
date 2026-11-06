import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAnalogClock } from '@tectra-ng/ui/analog-clock';

@Component({
  selector: 'analog-clock-basic-example',
  imports: [TxAnalogClock],
  template: `<tx-analog-clock ariaLabel="Local time" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalogClockBasicExample {}
