import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { segmentedBarSegments } from './segmented-bar-segments';
import { TxSegmentedBar } from './segmented-bar.component';
import { TxSegmentedBarItem, TxSegmentedBarSize } from './segmented-bar.types';

@Component({
  imports: [TxSegmentedBar],
  template: `
    <tx-segmented-bar
      id="main"
      [items]="items()"
      [size]="size()"
      [showLegend]="legend()"
      [showPercent]="percent()"
      [showValue]="value()"
      [hideEmptyInLegend]="hideEmpty()"
      [monoLabels]="mono()"
      ariaLabel="Status"
      [dt]="{ segmentedBar: { trackHeight: '10px' } }"
      [pt]="{ segment: { class: 'own-segment' } }"
    >
      <span class="own-aside">12 in total</span>
    </tx-segmented-bar>
    <tx-segmented-bar id="plain" [items]="items()" unstyled />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxSegmentedBarItem[]>([
    { key: 'ok', label: 'Healthy', value: 6, tone: 'success' },
    { key: 'warn', label: 'Warning', value: 3, tone: 'warn' },
    { key: 'none', label: 'Unknown', value: 0, tone: 'neutral' },
    { key: 'down', label: 'Down', value: 3 },
  ]);
  readonly size = signal<TxSegmentedBarSize>('small');
  readonly legend = signal(true);
  readonly percent = signal(false);
  readonly value = signal(true);
  readonly hideEmpty = signal(false);
  readonly mono = signal(false);
}

describe('segmented bar segments', () => {
  it('keeps the order, shares the positive total and marks empty parts', () => {
    const segments = segmentedBarSegments(
      [
        { key: 'a', label: 'A', value: 1 },
        { key: 'b', label: 'B', value: -4 },
        { key: 'c', label: 'C', value: 3, tone: 'danger' },
      ],
      String,
    );
    expect(segments.map((segment) => segment.key)).toEqual(['a', 'b', 'c']);
    expect(segments.map((segment) => segment.share)).toEqual([25, 0, 75]);
    expect(segments.map((segment) => segment.percent)).toEqual(['25%', '0%', '75%']);
    expect(segments.map((segment) => segment.isEmpty)).toEqual([false, true, false]);
    expect(segments.map((segment) => segment.tone)).toEqual(['primary', 'primary', 'danger']);
  });

  it('handles empty input and all-zero values', () => {
    expect(segmentedBarSegments(null, String)).toEqual([]);
    expect(segmentedBarSegments([{ key: 'a', label: 'A', value: 0 }], String)[0].share).toBe(0);
  });
});

describe('TxSegmentedBar', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const main = () => fixture.nativeElement.querySelector('#main') as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('draws the non-empty parts in order with widths, tones and titles', () => {
    const segments = [...main().querySelectorAll<HTMLElement>('.tx-segmented-bar__segment')];
    expect(segments.map((segment) => segment.dataset['tone'])).toEqual(['success', 'warn', 'primary']);
    expect(segments.map((segment) => segment.style.width)).toEqual(['50%', '25%', '25%']);
    expect(segments[0].title).toBe('Healthy: 6');
    expect(segments[0].textContent?.trim()).toBe('');
    expect(segments[0].classList).toContain('own-segment');
  });

  it('lists every part in the legend with its value and the projected aside', async () => {
    const labels = () => [...main().querySelectorAll('.tx-segmented-bar__label')].map((label) => label.textContent?.trim());
    expect(labels()).toEqual(['Healthy', 'Warning', 'Unknown', 'Down']);
    expect(main().querySelector('.tx-segmented-bar__value')?.textContent?.trim()).toBe('6');
    expect(main().querySelector('.tx-segmented-bar__percent')).toBeNull();
    expect(main().querySelector('.own-aside')?.textContent).toBe('12 in total');
    expect(main().querySelector('.tx-segmented-bar__legend')?.getAttribute('role')).toBe('list');
    host.hideEmpty.set(true);
    host.percent.set(true);
    host.value.set(false);
    await fixture.whenStable();
    expect(labels()).toEqual(['Healthy', 'Warning', 'Down']);
    expect(main().querySelector('.tx-segmented-bar__value')).toBeNull();
    expect(main().querySelector('.tx-segmented-bar__percent')?.textContent?.trim()).toBe('50%');
  });

  it('writes the percent inside the large bar', async () => {
    host.size.set('large');
    await fixture.whenStable();
    expect(main().dataset['size']).toBe('large');
    expect(main().querySelector('.tx-segmented-bar__segment')?.textContent?.trim()).toBe('50%');
  });

  it('names the bar for screen readers when the legend is hidden', async () => {
    const track = () => main().querySelector('.tx-segmented-bar__track') as HTMLElement;
    expect(track().getAttribute('aria-hidden')).toBe('true');
    host.legend.set(false);
    await fixture.whenStable();
    expect(main().querySelector('.tx-segmented-bar__legend')).toBeNull();
    expect(track().getAttribute('role')).toBe('img');
    expect(track().getAttribute('aria-label')).toBe('Status, Healthy: 6 (50%), Warning: 3 (25%), Unknown: 0 (0%), Down: 3 (25%)');
  });

  it('applies mono labels, dt and unstyled', async () => {
    host.mono.set(true);
    await fixture.whenStable();
    expect(main().classList).toContain('tx-segmented-bar--mono');
    expect(main().style.getPropertyValue('--tx-chart-segmented-bar-track-height')).toBe('10px');
    expect(main().hasAttribute('data-styled')).toBe(true);
    expect((fixture.nativeElement.querySelector('#plain') as HTMLElement).hasAttribute('data-styled')).toBe(false);
  });
});
