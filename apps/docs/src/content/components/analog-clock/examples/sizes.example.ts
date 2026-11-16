import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAnalogClock } from '@tectra-ng/ui/analog-clock';

@Component({
  selector: 'analog-clock-sizes-example',
  imports: [TxAnalogClock],
  template: `
    <div class="row">
      <tx-analog-clock
        ariaLabel="Small"
        time="2026-01-01T10:10:00"
        [dt]="{ root: { size: '96px' } }"
      />
      <tx-analog-clock ariaLabel="Default" time="2026-01-01T10:10:00" />
      <div class="box">
        <tx-analog-clock
          ariaLabel="Fills its box"
          time="2026-01-01T10:10:00"
          [dt]="{ root: { size: '100%' } }"
        />
      </div>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 32px;
    }
    .box {
      width: 280px;
      max-width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalogClockSizesExample {}
