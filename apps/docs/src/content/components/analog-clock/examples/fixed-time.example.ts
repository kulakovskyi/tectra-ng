import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxAnalogClock } from '@tectra-ng/ui/analog-clock';
import { TxSlider } from '@tectra-ng/ui/slider';

@Component({
  selector: 'analog-clock-fixed-time-example',
  imports: [FormsModule, TxAnalogClock, TxSlider],
  template: `
    <div class="row">
      <tx-analog-clock ariaLabel="Meeting starts" [time]="time()" />
      <div class="control">
        <span id="meeting-time-label">Meeting at {{ label() }}</span>
        <tx-slider
          ariaLabelledBy="meeting-time-label"
          [min]="0"
          [max]="1425"
          [step]="15"
          [ngModel]="minutes()"
          (ngModelChange)="set($event)"
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
    .control {
      display: grid;
      gap: 12px;
      width: 260px;
      font-size: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalogClockFixedTimeExample {
  readonly minutes = signal(9 * 60 + 30);
  readonly time = signal(this.at(this.minutes()));
  readonly label = signal('09:30');

  set(minutes: number): void {
    this.minutes.set(minutes);
    this.time.set(this.at(minutes));
    this.label.set(
      `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
    );
  }

  private at(minutes: number): Date {
    return new Date(2026, 0, 1, Math.floor(minutes / 60), minutes % 60);
  }
}
