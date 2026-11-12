import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxAnalogClockHandsPipe } from './analog-clock-hands.pipe';
import { TxAnalogClock } from './analog-clock.component';
import { clockHands, forwardAngle, validTimeZone } from './analog-clock.utils';

@Component({
  imports: [TxAnalogClock],
  template: `
    <tx-analog-clock id="fixed" timezone="UTC" ariaLabel="London office" [time]="time()" [showSeconds]="seconds()" [dt]="{ root: { size: '120px' } }" [pt]="{ minuteHand: { class: 'own' } }" />
    <tx-analog-clock id="live" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly time = signal<number>(Date.UTC(2026, 0, 1, 14, 30, 15));
  readonly seconds = signal(false);
}

describe('analog clock helpers', () => {
  it('reads hands in a time zone', () => {
    const at = Date.UTC(2026, 0, 1, 14, 30, 15);
    expect(clockHands(at, 'UTC')).toEqual({ time: '14:30', hourAngle: 75, minuteAngle: 180, secondAngle: 90 });
    expect(clockHands(at, 'Asia/Tokyo').time).toBe('23:30');
    expect(clockHands(at, 'Nope/Zone').time).toBe(clockHands(at, null).time);
    expect(new TxAnalogClockHandsPipe().transform(at, 'UTC').minuteAngle).toBe(180);
    expect(validTimeZone('')).toBeUndefined();
    expect(validTimeZone('Europe/Kyiv')).toBe('Europe/Kyiv');
  });

  it('keeps hands turning forward over twelve', () => {
    expect(forwardAngle(null, 354)).toBe(354);
    expect(forwardAngle(354, 0)).toBe(360);
    expect(forwardAngle(360, 6)).toBe(366);
    expect(forwardAngle(714, 0)).toBe(720);
    expect(forwardAngle(90, 90)).toBe(90);
  });
});

describe('TxAnalogClock', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('draws twelve ticks, the hands and a labelled face', () => {
    expect(fixture.nativeElement.querySelectorAll('#fixed .tx-analog-clock__tick')).toHaveLength(12);
    expect(fixture.nativeElement.querySelectorAll('#fixed .tx-analog-clock__tick--major')).toHaveLength(4);
    expect(el('#fixed [role="img"]').getAttribute('aria-label')).toBe('London office, 14:30');
    expect(el('#fixed .tx-analog-clock__hand--hour').style.getPropertyValue('--tx-analog-clock-angle')).toBe('75deg');
    expect(el('#fixed .tx-analog-clock__hand--minute').style.getPropertyValue('--tx-analog-clock-angle')).toBe('180deg');
    expect(el('#fixed .tx-analog-clock__hand--minute').classList).toContain('own');
    expect(el('#fixed').style.getPropertyValue('--tx-analog-clock-size')).toBe('120px');
    expect(el('#fixed .tx-analog-clock__hand--second')).toBeNull();
    expect(el('#live [role="img"]').getAttribute('aria-label')).toMatch(/^\d{2}:\d{2}$/);
  });

  it('shows seconds and turns forward past the hour', async () => {
    fixture.componentInstance.seconds.set(true);
    fixture.componentInstance.time.set(Date.UTC(2026, 0, 1, 14, 59, 0));
    await fixture.whenStable();
    expect(el('#fixed .tx-analog-clock__hand--second')).not.toBeNull();
    expect(el('#fixed .tx-analog-clock__hand--minute').style.getPropertyValue('--tx-analog-clock-angle')).toBe('354deg');
    fixture.componentInstance.time.set(Date.UTC(2026, 0, 1, 15, 0, 0));
    await fixture.whenStable();
    expect(el('#fixed .tx-analog-clock__hand--minute').style.getPropertyValue('--tx-analog-clock-angle')).toBe('360deg');
    expect(el('#fixed [role="img"]').getAttribute('aria-label')).toBe('London office, 15:00');
  });
});

@Component({
  imports: [TxAnalogClock, TxAnalogClockHandsPipe],
  template: `
    <tx-analog-clock id="ticking" timezone="UTC" showSeconds />
    <span class="minute-angle">{{ (at | txAnalogClockHands: 'UTC').minuteAngle }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TickingHost {
  readonly at = Date.UTC(2026, 0, 1, 9, 15, 0);
}

describe('TxAnalogClock following the time', () => {
  afterEach(() => vi.useRealTimers());

  it('moves the second hand every second and reads hands through the pipe', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1, 10, 0, 0, 500)));
    const fixture = TestBed.createComponent(TickingHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const second = () => (fixture.nativeElement.querySelector('#ticking .tx-analog-clock__hand--second') as HTMLElement).style.getPropertyValue('--tx-analog-clock-angle');
    expect(second()).toBe('0deg');
    vi.advanceTimersByTime(1000);
    await fixture.whenStable();
    expect(second()).toBe('6deg');
    expect(fixture.nativeElement.querySelector('.minute-angle').textContent).toBe('90');
    fixture.destroy();
  });
});
