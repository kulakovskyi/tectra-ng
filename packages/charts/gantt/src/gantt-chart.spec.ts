import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxGanttChart } from './gantt-chart.component';
import { TxGanttGroupToggle, TxGanttLayout, TxGanttTask, TxGanttTaskEvent, TxGanttZoom } from './gantt-chart.types';

@Component({
  imports: [TxGanttChart],
  template: `
    <tx-gantt-chart
      id="main"
      [tasks]="tasks"
      [layout]="layout()"
      [(zoom)]="zoom"
      today="2026-03-10"
      [pt]="{ bar: { class: 'own-bar' } }"
      (taskClick)="clicks.push($event)"
      (groupToggle)="toggles.push($event)"
    />
    <tx-gantt-chart id="empty" [tasks]="[]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tasks: TxGanttTask[] = [
    { id: 'a', label: 'Brief', start: '2026-03-02', end: '2026-03-04', group: 'Design', progress: 100 },
    { id: 'b', label: 'Mockups', start: '2026-03-05', end: '2026-03-11', group: 'Design', progress: 40 },
    { id: 'c', label: 'API', start: '2026-03-09', end: '2026-03-20', group: 'Build' },
    { id: 'd', label: 'Launch', start: '2026-03-23', milestone: true },
  ];
  readonly layout = signal<TxGanttLayout>('tasks');
  readonly zoom = signal<TxGanttZoom>('day');
  readonly clicks: TxGanttTaskEvent[] = [];
  readonly toggles: TxGanttGroupToggle[] = [];
}

describe('TxGanttChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('draws group rows, task bars with progress, a milestone and the today line', () => {
    expect(all('#main .tx-gantt-chart__label .tx-gantt-chart__label-text').map((label) => label.textContent?.trim())).toEqual(['Launch', 'Design', 'Brief', 'Mockups', 'Build', 'API']);
    expect(all('#main .tx-gantt-chart__count').map((count) => count.textContent?.trim())).toEqual(['2', '1']);
    const bars = all('#main .tx-gantt-chart__bar');
    expect(bars).toHaveLength(3);
    expect(bars[0].classList).toContain('own-bar');
    expect(bars[0].style.left).toBe('120px');
    expect(bars[0].style.width).toBe('120px');
    expect(bars[1].style.getPropertyValue('--tx-gantt-chart-progress')).toBe('40%');
    expect(all('#main .tx-gantt-chart__milestone')).toHaveLength(1);
    expect(all('#main .tx-gantt-chart__summary')).toHaveLength(2);
    expect(el('#main .tx-gantt-chart__today').style.left).toBe('calc(var(--tx-gantt-chart-label-width) + 440px)');
    expect(bars[1].getAttribute('aria-label')).toBe('Mockups, Mar 5, 2026 – Mar 11, 2026 · 7 days, Progress: 40%');
    expect(el('#main .tx-gantt-chart__scroll').getAttribute('aria-label')).toBe('Gantt chart, 4 tasks, Feb 27, 2026 – Mar 25, 2026');
  });

  it('switches the zoom from the toolbar and redraws the scale', async () => {
    expect(all('#main .tx-gantt-chart__tier:not(.tx-gantt-chart__tier--top) .tx-gantt-chart__tick--weekend').length).toBeGreaterThan(0);
    const buttons = all('#main .tx-gantt-chart__toolbar tx-button-group button');
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Quarters', 'Months', 'Weeks', 'Days']);
    expect(buttons[3].getAttribute('aria-pressed')).toBe('true');
    buttons[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.zoom()).toBe('month');
    expect(el('#main').getAttribute('data-zoom')).toBe('month');
    expect(all('#main .tx-gantt-chart__tier--top .tx-gantt-chart__tick').map((tick) => tick.textContent?.trim())).toEqual(['2026']);
    expect(el('#main .tx-gantt-chart__bar').style.left).toBe('15px');
  });

  it('folds a group and reports it', async () => {
    const toggle = el('#main .tx-gantt-chart__toggle');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.toggles).toEqual([{ group: 'Design', collapsed: true }]);
    expect(all('#main .tx-gantt-chart__bar')).toHaveLength(1);
    expect(el('#main .tx-gantt-chart__toggle').getAttribute('aria-expanded')).toBe('false');
  });

  it('puts the tasks of a group on one lane in the timeline layout with labels inside', async () => {
    fixture.componentInstance.layout.set('timeline');
    await fixture.whenStable();
    expect(all('#main .tx-gantt-chart__row')).toHaveLength(3);
    expect(all('#main .tx-gantt-chart__bar--inside')).toHaveLength(3);
    expect(el('#main .tx-gantt-chart__corner').textContent?.trim()).toBe('Timeline');
  });

  it('moves between the bars with the keyboard, zooms with + and − and reports a click', async () => {
    const bars = () => all('#main .tx-gantt-chart__bar, #main .tx-gantt-chart__milestone');
    expect(bars().filter((bar) => bar.tabIndex === 0)).toHaveLength(1);
    const first = el('#main [data-task="d"]');
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main [data-task="a"]').tabIndex).toBe(0);
    el('#main [data-task="a"]').dispatchEvent(new KeyboardEvent('keydown', { key: '-', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.zoom()).toBe('week');
    el('#main [data-task="c"]').click();
    expect(fixture.componentInstance.clicks[0].task.id).toBe('c');
    expect(fixture.componentInstance.clicks[0].end.getDate()).toBe(21);
  });

  it('shows "No data" without tasks', () => {
    expect(el('#empty .tx-gantt-chart__empty').textContent).toContain('No data');
    expect(el('#empty .tx-gantt-chart__today')).toBeNull();
  });
});
