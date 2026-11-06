import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCountdown } from '@tectra-ng/ui/countdown';

@Component({
  selector: 'countdown-units-example',
  imports: [TxCountdown],
  template: `
    <ul class="list">
      <li>Session expires in <tx-countdown [value]="15" unit="minutes" suffix="min" /></li>
      <li>Next sync in <tx-countdown [value]="6" unit="hours" suffix="h" /></li>
      <li>Trial ends in <tx-countdown [value]="12" unit="days" suffix="days" /></li>
      <li>
        Same 15 minutes as a clock: <tx-countdown [value]="15" unit="minutes" format="clock" />
      </li>
    </ul>
  `,
  styles: `
    .list {
      display: grid;
      gap: 8px;
      margin: 0;
      padding-left: 18px;
      font-size: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CountdownUnitsExample {}
