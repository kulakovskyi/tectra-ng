import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAnalogClock, TxAnalogClockHandsPipe } from '@tectra-ng/ui/analog-clock';

@Component({
  selector: 'analog-clock-time-zones-example',
  imports: [TxAnalogClock, TxAnalogClockHandsPipe],
  template: `
    <div class="grid">
      @for (office of offices; track office.zone) {
        <figure>
          <tx-analog-clock
            [timezone]="office.zone"
            [ariaLabel]="office.city"
            [dt]="{ root: { size: '120px' } }"
          />
          <figcaption>
            <strong>{{ office.city }}</strong>
            <span>{{ (now | txAnalogClockHands: office.zone).time }}</span>
          </figcaption>
        </figure>
      }
    </div>
  `,
  styles: `
    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
    }
    figure {
      display: grid;
      justify-items: center;
      gap: 12px;
      margin: 0;
    }
    figcaption {
      display: grid;
      justify-items: center;
      font-size: 13px;
    }
    figcaption span {
      color: var(--tx-text-muted);
      font-variant-numeric: tabular-nums;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalogClockTimeZonesExample {
  readonly now = Date.now();
  readonly offices = [
    { city: 'Kyiv', zone: 'Europe/Kyiv' },
    { city: 'Lisbon', zone: 'Europe/Lisbon' },
    { city: 'New York', zone: 'America/New_York' },
    { city: 'Tokyo', zone: 'Asia/Tokyo' },
  ];
}
