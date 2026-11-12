import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TectraChartTokens, TectraDeepPartial } from '@tectra-ng/themes';
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

@Component({
  imports: [TxGauge],
  template: `
    <tx-gauge
      [value]="value()"
      [bands]="bands()"
      [needle]="needle()"
      [color]="color()"
      [showTicks]="showTicks()"
      [showValue]="showValue()"
      [ticks]="ticks()"
      [startAngle]="startAngle()"
      [endAngle]="endAngle()"
      [dt]="dt()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {
  readonly value = signal<number | null | undefined>(0);
  readonly bands = signal<TxGaugeBand[] | null>(null);
  readonly needle = signal<boolean | undefined>(undefined);
  readonly color = signal<string | undefined>(undefined);
  readonly showTicks = signal(true);
  readonly showValue = signal(true);
  readonly ticks = signal(2);
  readonly startAngle = signal(-90);
  readonly endAngle = signal(90);
  readonly dt = signal<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
}

describe('TxGauge options', () => {
  let fixture: ComponentFixture<OptionsHost>;
  let host: OptionsHost;
  const gauge = () => fixture.debugElement.query(By.directive(TxGauge)).componentInstance as TxGauge;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(OptionsHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('draws no progress arc at the minimum and treats missing bands as none', () => {
    expect(gauge().bandList()).toEqual([]);
    expect(gauge().hasNeedle()).toBe(false);
    expect(gauge().progress()).toBe('');
    expect(el('.tx-gauge__value').textContent?.trim()).toBe('0');
  });

  it('anchors tick labels by their side of a half circle', () => {
    expect(gauge().tickMarks().map((tick) => [tick.label, tick.anchor])).toEqual([
      ['0', 'end'],
      ['50', 'middle'],
      ['100', 'start'],
    ]);
    expect(all('.tx-gauge__tick-label').map((label) => label.getAttribute('text-anchor'))).toEqual(['end', 'middle', 'start']);
  });

  it('gives the arc more room without ticks', async () => {
    const radius = gauge().fit().radius;
    host.showTicks.set(false);
    await fixture.whenStable();
    expect(gauge().tickRoom()).toBe(0);
    expect(all('.tx-gauge__tick')).toHaveLength(0);
    expect(gauge().fit().radius).toBeGreaterThan(radius);
  });

  it('shows "No data" for an undefined value', async () => {
    host.value.set(undefined);
    await fixture.whenStable();
    expect(gauge().angle()).toBe(gauge().span()[0]);
    expect(gauge().formatted()).toBe('—');
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
  });

  it('grows the arc without the value text, with and without a needle', async () => {
    host.value.set(40);
    await fixture.whenStable();
    const radius = gauge().fit().radius;
    host.showValue.set(false);
    await fixture.whenStable();
    expect(el('.tx-gauge__value')).toBeNull();
    const bare = gauge().fit().radius;
    expect(bare).toBeGreaterThanOrEqual(radius);
    host.needle.set(true);
    await fixture.whenStable();
    expect(el('.tx-gauge__needle')).not.toBeNull();
    expect(gauge().fit().radius).toBeLessThanOrEqual(bare);
  });

  it('skips empty bands and falls back to the neutral tone without a label', async () => {
    host.value.set(30);
    host.bands.set([
      { from: 0, to: 40 },
      { from: 40, to: 40, label: 'Edge' },
      { from: 100, to: 40, color: '#00aa00', label: 'High' },
    ]);
    await fixture.whenStable();
    const arcs = gauge().bandArcs();
    expect(arcs.map((arc) => [arc.color, arc.label])).toEqual([
      ['var(--tx-chart-gauge-neutral-color)', null],
      ['#00aa00', 'High'],
    ]);
    expect(el('.tx-chart-frame__plot').getAttribute('aria-label')).toBe('Gauge: 30 of 0 to 100');
  });

  it('paints the progress arc in its own colour', async () => {
    host.value.set(60);
    host.color.set('#123456');
    await fixture.whenStable();
    expect(el('.tx-gauge__progress').style.stroke).toBe('#123456');
  });

  it('reads the arc thickness and tick geometry from the tokens', async () => {
    host.value.set(60);
    await fixture.whenStable();
    const width = gauge().width();
    host.dt.set({ gauge: { thickness: '0.3', tickLength: '12' } } as TectraDeepPartial<TectraChartTokens>);
    await fixture.whenStable();
    expect(gauge().geometry()).toMatchObject({ thickness: 0.3, tickLength: 12 });
    expect(gauge().width()).toBeGreaterThan(width);
  });
});
