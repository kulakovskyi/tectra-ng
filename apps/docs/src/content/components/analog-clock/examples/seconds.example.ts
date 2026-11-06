import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAnalogClock } from '@tectra-ng/ui/analog-clock';

@Component({
  selector: 'analog-clock-seconds-example',
  imports: [TxAnalogClock],
  template: `<tx-analog-clock [showSeconds]="true" ariaLabel="With seconds" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalogClockSecondsExample {}
