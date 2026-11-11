import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxGauge } from './gauge.component';
import { TxGaugeBand } from './gauge.types';
import { gaugeAngle, gaugeNeedle, gaugeRatio } from './gauge-layout';

@Component({
  imports: [TxGauge],
  template: `
    <tx-gauge id="progress" [value]="value()" label="CPU" valueFormat="percent" tone="success" />
    <tx-gauge id="needle" [value]="value()" [bands]="bands" ariaLabel="Response time" [pt]="{ needle: { class: 'own-needle' } }" />
    <tx-gauge id="empty" [value]="null" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal(72);
  readonly bands: TxGaugeBand[] = [
    { from: 0, to: 50, tone: 'success', label: 'Fast' },
    { from: 50, to: 80, tone: 'warn', label: 'Slow' },
    { from: 80, to: 100, color: 'red', label: 'Too slow' },
  ];
}

describe('gauge layout', () => {
  it('maps a value onto the arc', () => {
    expect(gaugeRatio(25, 0, 100)).toBe(0.25);
    expect(gaugeRatio(150, 0, 100)).toBe(1);
    expect(gaugeRatio(null, 0, 100)).toBe(0);
    expect(gaugeAngle(50, 0, 100, -1, 1)).toBe(0);
    expect(gaugeNeedle(50, 50, 40, 4)).toBe('M48,50L49,10L51,10L52,50Z');
  });
});

describe('TxGauge', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('draws a progress arc in the tone with the value and the label', () => {
    expect(el('#progress').getAttribute('data-mode')).toBe('progress');
    expect(el('#progress .tx-gauge__progress').style.stroke).toBe('var(--tx-chart-gauge-success-color)');
    expect(el('#progress .tx-gauge__value').textContent?.trim()).toBe('72%');
    expect(el('#progress .tx-gauge__label').textContent?.trim()).toBe('CPU');
    expect(all('#progress .tx-gauge__tick-label').map((label) => label.textContent?.trim())).toEqual(['0%', '20%', '40%', '60%', '80%', '100%']);
    expect(el('#progress .tx-chart-frame__plot').getAttribute('aria-label')).toBe('Gauge, CPU: 72% of 0% to 100%');
    expect(el('#progress .tx-chart-frame__plot').getAttribute('tabindex')).toBeNull();
  });

  it('turns to a needle over bands', async () => {
    expect(el('#needle').getAttribute('data-mode')).toBe('needle');
    expect(all('#needle .tx-gauge__band').map((band) => band.style.stroke)).toEqual(['var(--tx-chart-gauge-success-color)', 'var(--tx-chart-gauge-warn-color)', 'red']);
    expect(el('#needle .tx-gauge__progress')).toBeNull();
    const needle = el('#needle .tx-gauge__needle');
    expect(needle.classList).toContain('own-needle');
    expect(needle.style.transform).toBe('rotate(52.8deg)');
    expect(el('#needle .tx-chart-frame__plot').getAttribute('aria-label')).toBe('Response time, Gauge: 72 of 0 to 100, Slow');
    fixture.componentInstance.value.set(10);
    await fixture.whenStable();
    expect(el('#needle .tx-gauge__needle').style.transform).toBe('rotate(-96deg)');
  });

  it('shows "No data" without a value', () => {
    expect(el('#empty .tx-chart-frame__empty')).not.toBeNull();
  });
});
