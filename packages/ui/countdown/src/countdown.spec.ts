import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxCountdown } from './countdown.component';
import { TxCountdownValue } from './countdown.templates';
import { TxCountdownFormat, TxCountdownUnit } from './countdown.types';
import { formatRemaining, splitRemaining, targetTime } from './countdown.utils';
import { TxRemainingTimePipe } from './remaining-time.pipe';

@Component({
  imports: [TxCountdown, TxCountdownValue],
  template: `
    <tx-countdown
      id="value"
      suffix="s"
      [value]="value()"
      [unit]="unit()"
      [format]="format()"
      [endingSoon]="endingSoon()"
      [paused]="paused()"
      [dt]="{ root: { endingColor: 'orange' } }"
      (completed)="completions = completions + 1"
    />
    <tx-countdown id="target" [target]="target()" />
    <tx-countdown id="template" [value]="90" unit="minutes">
      <ng-template txCountdownValue let-ms let-hours="hours" let-minutes="minutes"><b>{{ hours }}h {{ minutes }}m ({{ ms > 5340000 ? 'over' : 'under' }} 89m)</b></ng-template>
    </tx-countdown>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal<number | undefined>(5);
  readonly unit = signal<TxCountdownUnit>('seconds');
  readonly format = signal<TxCountdownFormat | undefined>(undefined);
  readonly endingSoon = signal(0);
  readonly paused = signal(false);
  readonly target = signal<Date | null>(new Date(Date.now() + 65000));
  completions = 0;
}

describe('countdown helpers', () => {
  it('formats and splits remaining time', () => {
    expect([0, 999, 1000, 65000, 30 * 60000, 3599000, 3600000, 7507000].map(formatRemaining)).toEqual(['00:00', '00:00', '00:01', '01:05', '30:00', '59:59', '1:00:00', '2:05:07']);
    expect(formatRemaining(-5000)).toBe('00:00');
    expect(formatRemaining(null)).toBe('00:00');
    expect(new TxRemainingTimePipe().transform(65000)).toBe('01:05');
    expect(splitRemaining(93784000)).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4 });
    expect(targetTime('')).toBeNull();
    expect(targetTime('nope')).toBeNull();
    expect(targetTime(1000)).toBe(1000);
  });
});

describe('TxCountdown', () => {
  let fixture: ComponentFixture<Host>;
  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
  const advance = async (ms: number) => {
    for (let step = 0; step < ms; step += 100) {
      vi.advanceTimersByTime(Math.min(100, ms - step));
      await fixture.whenStable();
    }
  };

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => vi.useRealTimers());

  it('counts the value down and completes once', async () => {
    expect(el('value').textContent?.trim()).toBe('5 s');
    expect(el('value').getAttribute('role')).toBe('timer');
    await advance(2050);
    expect(el('value').textContent?.trim()).toBe('3 s');
    await advance(3100);
    expect(el('value').textContent?.trim()).toBe('0 s');
    expect(el('value').classList).toContain('tx-countdown--expired');
    expect(fixture.componentInstance.completions).toBe(1);
    await advance(5000);
    expect(fixture.componentInstance.completions).toBe(1);
  });

  it('restarts when the value changes and counts bigger units', async () => {
    fixture.componentInstance.value.set(2);
    fixture.componentInstance.unit.set('minutes');
    await fixture.whenStable();
    expect(el('value').textContent?.trim()).toBe('2 s');
    await advance(61050);
    expect(el('value').textContent?.trim()).toBe('1 s');
    fixture.componentInstance.format.set('clock');
    await fixture.whenStable();
    expect(el('value').textContent?.trim()).toBe('00:59 s');
  });

  it('counts to a target date as a clock', async () => {
    expect(el('target').textContent?.trim()).toBe('01:05');
    await advance(6050);
    expect(el('target').textContent?.trim()).toBe('00:59');
  });

  it('marks the end as soon and pauses', async () => {
    fixture.componentInstance.endingSoon.set(3000);
    await fixture.whenStable();
    expect(el('value').classList).not.toContain('tx-countdown--ending');
    expect(el('value').style.getPropertyValue('--tx-countdown-ending-color')).toBe('orange');
    await advance(2100);
    expect(el('value').classList).toContain('tx-countdown--ending');
    fixture.componentInstance.paused.set(true);
    await fixture.whenStable();
    const frozen = el('value').textContent;
    await advance(10000);
    expect(el('value').textContent).toBe(frozen);
    expect(el('value').classList).toContain('tx-countdown--paused');
    fixture.componentInstance.paused.set(false);
    await fixture.whenStable();
    await advance(3100);
    expect(fixture.componentInstance.completions).toBe(1);
  });

  it('renders an own template with the parts', async () => {
    expect(el('template').textContent?.trim()).toBe('1h 30m (over 89m)');
    await advance(60050);
    expect(el('template').textContent?.trim()).toBe('1h 29m (under 89m)');
  });

  it('restarts frozen while paused and shows zero without a deadline', async () => {
    fixture.componentInstance.paused.set(true);
    await fixture.whenStable();
    fixture.componentInstance.value.set(8);
    await fixture.whenStable();
    await advance(3000);
    expect(el('value').textContent?.trim()).toBe('8 s');
    fixture.componentInstance.value.set(undefined);
    fixture.componentInstance.format.set('number');
    await fixture.whenStable();
    expect(el('value').textContent?.trim()).toBe('0 s');
    expect(el('value').classList).not.toContain('tx-countdown--expired');
    fixture.componentInstance.target.set(null);
    await fixture.whenStable();
    expect(el('target').textContent?.trim()).toBe('00:00');
    fixture.destroy();
  });

  it('narrows the value template context', () => {
    expect(TxCountdownValue.ngTemplateContextGuard({} as TxCountdownValue, { $implicit: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })).toBe(true);
  });
});

@Component({
  imports: [TxRemainingTimePipe],
  template: `<span class="left">{{ 3725000 | txRemainingTime }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PipeHost {}

@Component({
  imports: [TxCountdown],
  template: `<tx-countdown id="idle" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class IdleHost {}

describe('TxCountdown without a deadline', () => {
  it('shows zero, never completes and leaves cleanly', async () => {
    const fixture = TestBed.createComponent(IdleHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const countdown = fixture.nativeElement.querySelector('#idle') as HTMLElement;
    expect(countdown.textContent?.trim()).toBe('0');
    expect(countdown.classList).not.toContain('tx-countdown--expired');
    expect(() => fixture.destroy()).not.toThrow();
  });
});

describe('TxRemainingTimePipe in a template', () => {
  it('formats milliseconds as a clock', () => {
    const fixture = TestBed.createComponent(PipeHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.left').textContent).toBe('1:02:05');
  });
});

describe('TxCountdown recompiled by TestBed', () => {
  it('still finds its value template when a test overrides the component', async () => {
    TestBed.overrideComponent(TxCountdown, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#template b')).not.toBeNull();
    fixture.destroy();
  });
});

