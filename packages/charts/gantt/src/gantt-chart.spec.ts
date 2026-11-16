import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxGanttChart } from './gantt-chart.component';
import { TxGanttDate, TxGanttGroupToggle, TxGanttLayout, TxGanttTask, TxGanttTaskEvent, TxGanttZoom } from './gantt-chart.types';

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

beforeEach(() => vi.stubGlobal('CSS', { escape: (value: string) => value.replace(/["\\]/g, '\\$&') }));
afterEach(() => vi.unstubAllGlobals());

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
    expect(el('#main .tx-gantt-chart__toggle').getAttribute('aria-expanded')).toBe('false');
    const fold = el(`#${toggle.getAttribute('aria-controls')}`);
    expect(fold.classList).toContain('tx-gantt-chart__fold--collapsed');
    expect(fold.hasAttribute('inert')).toBe(true);
    expect(Array.from(fold.querySelectorAll('[data-task]')).map((bar) => bar.getAttribute('data-task'))).toEqual(['a', 'b']);
    expect(all('#main .tx-gantt-chart__fold--collapsed')).toHaveLength(1);
    expect(all('#main [data-task]').filter((bar) => bar.tabIndex === 0).map((bar) => bar.dataset['task'])).toEqual(['d']);
    el('#main [data-task="d"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main [data-task="c"]').tabIndex).toBe(0);
    toggle.click();
    await fixture.whenStable();
    expect(fold.classList).not.toContain('tx-gantt-chart__fold--collapsed');
    expect(fold.hasAttribute('inert')).toBe(false);
  });

  it('puts the tasks of a group on one lane in the timeline layout with labels inside', async () => {
    fixture.componentInstance.layout.set('timeline');
    await fixture.whenStable();
    expect(all('#main .tx-gantt-chart__row')).toHaveLength(3);
    expect(all('#main .tx-gantt-chart__toggle')).toHaveLength(0);
    expect(all('#main .tx-gantt-chart__fold--collapsed')).toHaveLength(0);
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

@Component({
  imports: [TxGanttChart],
  template: `
    <tx-gantt-chart
      [tasks]="tasks()"
      [layout]="layout()"
      [(zoom)]="zoom"
      [today]="today()"
      [ariaLabel]="label()"
      [barLabels]="barLabels()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InteractiveHost {
  readonly tasks = signal<TxGanttTask[] | null>([
    { id: 'a', label: 'Brief', start: '2026-03-02', end: '2026-03-04', group: 'Design' },
    { id: 'b', label: 'Mockups', start: '2026-03-05', end: '2026-03-11', group: 'Design', progress: Number.NaN },
    { id: 'c', label: 'API', start: '2026-03-09', end: '2026-03-20', group: 'Build', progress: 140 },
  ]);
  readonly layout = signal<TxGanttLayout>('tasks');
  readonly zoom = signal<TxGanttZoom>('week');
  readonly today = signal<TxGanttDate | null>('2026-03-10');
  readonly label = signal('');
  readonly barLabels = signal<'auto' | 'outside' | 'inside' | 'none'>('auto');
}

describe('TxGanttChart interaction', () => {
  let fixture: ComponentFixture<InteractiveHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const host = () => fixture.componentInstance;
  const scroller = () => el('.tx-gantt-chart__scroll');
  const key = (task: string, name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    el(`[data-task="${task}"]`).dispatchEvent(event);
    return event;
  };
  const measure = (clientWidth: number) => {
    Object.defineProperty(scroller(), 'clientWidth', { configurable: true, value: clientWidth });
    Object.defineProperty(el('.tx-gantt-chart__corner'), 'offsetWidth', { configurable: true, value: 200 });
    Object.defineProperty(scroller(), 'scrollLeft', { configurable: true, writable: true, value: 0 });
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(InteractiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });


  it('zooms around the pointer with ctrl or cmd and the wheel', async () => {
    measure(800);
    const wheel = (init: WheelEventInit) => {
      const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: 500, ...init });
      scroller().dispatchEvent(event);
      return event;
    };
    expect(wheel({ deltaY: -100 }).defaultPrevented).toBe(false);
    expect(wheel({ ctrlKey: true, deltaY: 0 }).defaultPrevented).toBe(false);
    expect(host().zoom()).toBe('week');
    expect(wheel({ ctrlKey: true, deltaY: -100 }).defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(host().zoom()).toBe('day');
    expect(Math.abs(scroller().scrollLeft - (200 + 300 * (40 / 16) - 500))).toBeLessThan(2);
    wheel({ metaKey: true, deltaY: 100 });
    await fixture.whenStable();
    expect(host().zoom()).toBe('week');
    expect(scroller().scrollLeft).toBeLessThan(2);
  });

  it('keeps the centre of the view when the zoom changes from the toolbar', async () => {
    measure(800);
    scroller().scrollLeft = 100;
    const buttons = all('tx-button-group button');
    buttons[2].click();
    await fixture.whenStable();
    expect(scroller().scrollLeft).toBe(100);
    buttons[3].click();
    await fixture.whenStable();
    expect(host().zoom()).toBe('day');
    expect(Math.abs(scroller().scrollLeft - (200 + (100 + 300) * (40 / 16) - 500))).toBeLessThan(2);
  });

  it('scrolls to today from the toolbar, smoothly unless motion is reduced', async () => {
    measure(400);
    const scrollTo = vi.fn();
    scroller().scrollTo = scrollTo;
    const today = all('.tx-gantt-chart__toolbar > button').find((button) => button.textContent?.includes('Today')) as HTMLElement;
    today.click();
    const x = Number(el('.tx-gantt-chart__today').style.left.match(/\+ ([\d.]+)px/)?.[1]);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: Math.max(0, x - 200 * 0.3), behavior: 'smooth' });
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ matches: true, media: query })) as unknown as typeof window.matchMedia;
    try {
      today.click();
    } finally {
      window.matchMedia = original;
    }
    expect(scrollTo).toHaveBeenLastCalledWith({ left: Math.max(0, x - 200 * 0.3), behavior: 'auto' });
  });

  it('hides the today line when today is off or outside the range', async () => {
    host().today.set(null);
    await fixture.whenStable();
    expect(el('.tx-gantt-chart__today')).toBeNull();
    const chart = fixture.debugElement.query(By.directive(TxGanttChart)).componentInstance as TxGanttChart;
    const scrollTo = vi.fn();
    scroller().scrollTo = scrollTo;
    chart.scrollToToday();
    expect(scrollTo).not.toHaveBeenCalled();
    host().today.set('2027-01-01');
    await fixture.whenStable();
    expect(el('.tx-gantt-chart__today')).toBeNull();
    expect(all('.tx-gantt-chart__toolbar > button')).toHaveLength(0);
  });

  it('names the region after the aria label and draws only valid progress', async () => {
    host().label.set('Roadmap');
    await fixture.whenStable();
    expect(scroller().getAttribute('aria-label')).toMatch(/^Roadmap\. Gantt chart, 3 tasks/);
    expect(el('[data-task="b"]').style.getPropertyValue('--tx-gantt-chart-progress')).toBe('');
    expect(el('[data-task="c"]').style.getPropertyValue('--tx-gantt-chart-progress')).toBe('100%');
    expect(el('[data-task="c"]').getAttribute('aria-label')).toContain('Progress: 140%');
  });

  it('shows the empty state for missing tasks and when every bar label is off', async () => {
    host().barLabels.set('none');
    await fixture.whenStable();
    expect(all('.tx-gantt-chart__bar-label')).toHaveLength(0);
    host().tasks.set(null);
    await fixture.whenStable();
    expect(el('.tx-gantt-chart__empty').textContent).toContain('No data');
  });

  it('zooms with + = and _ and walks the bars with arrows, Home and End', async () => {
    expect(key('a', '+').defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(host().zoom()).toBe('day');
    key('a', '=');
    await fixture.whenStable();
    expect(host().zoom()).toBe('day');
    key('a', '_');
    await fixture.whenStable();
    expect(host().zoom()).toBe('week');
    const focused = () => all('[data-task]').find((bar) => bar.tabIndex === 0)?.dataset['task'];
    key('a', 'ArrowRight');
    await fixture.whenStable();
    expect(focused()).toBe('b');
    expect(document.activeElement).toBe(el('[data-task="b"]'));
    key('b', 'End');
    await fixture.whenStable();
    expect(focused()).toBe('c');
    key('c', 'ArrowRight');
    await fixture.whenStable();
    expect(focused()).toBe('c');
    key('c', 'Home');
    await fixture.whenStable();
    expect(focused()).toBe('a');
    key('a', 'ArrowLeft');
    await fixture.whenStable();
    expect(focused()).toBe('a');
    key('a', 'ArrowUp');
    await fixture.whenStable();
    expect(focused()).toBe('a');
    key('c', 'ArrowUp');
    await fixture.whenStable();
    expect(focused()).toBe('b');
    expect(key('b', 'Enter').defaultPrevented).toBe(false);
  });

  it('jumps to the closest bar of the next lane in the timeline', async () => {
    host().tasks.update((tasks) => [...(tasks ?? []), { id: 'e', label: 'QA', start: '2026-03-23', end: '2026-03-25', group: 'Build' }]);
    host().layout.set('timeline');
    await fixture.whenStable();
    const focused = () => all('[data-task]').find((bar) => bar.tabIndex === 0)?.dataset['task'];
    key('c', 'ArrowUp');
    await fixture.whenStable();
    expect(focused()).toBe('b');
    key('a', 'ArrowDown');
    await fixture.whenStable();
    expect(focused()).toBe('c');
  });

  it('keeps no tab stop when every group is folded', async () => {
    all('.tx-gantt-chart__toggle').forEach((toggle) => toggle.click());
    await fixture.whenStable();
    expect(all('[data-task]').filter((bar) => bar.tabIndex === 0)).toHaveLength(0);
    expect(key('a', 'Home').defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(all('[data-task]').filter((bar) => bar.tabIndex === 0)).toHaveLength(0);
  });

  it('scrolls a focused bar into the visible lane', async () => {
    const scrollBy = vi.fn();
    scroller().scrollBy = scrollBy;
    measure(400);
    vi.spyOn(scroller(), 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 400, 200));
    const bar = el('[data-task="a"]');
    const rect = vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue(new DOMRect(150, 0, 40, 20));
    bar.dispatchEvent(new FocusEvent('focus'));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 150 - 200 - 16, behavior: 'smooth' });
    rect.mockReturnValue(new DOMRect(380, 0, 60, 20));
    bar.dispatchEvent(new FocusEvent('focus'));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: Math.min(440 - 400 + 16, 380 - 200 - 16), behavior: 'smooth' });
    rect.mockReturnValue(new DOMRect(250, 0, 60, 20));
    bar.dispatchEvent(new FocusEvent('focus'));
    expect(scrollBy).toHaveBeenCalledTimes(2);
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ matches: true, media: query })) as unknown as typeof window.matchMedia;
    try {
      rect.mockReturnValue(new DOMRect(100, 0, 40, 20));
      bar.dispatchEvent(new FocusEvent('focus'));
    } finally {
      window.matchMedia = original;
    }
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 100 - 200 - 16, behavior: 'auto' });
  });
});

describe('TxGanttChart standalone', () => {
  it('clamps zoom steps to the available levels', () => {
    const fixture = TestBed.createComponent(TxGanttChart);
    fixture.componentInstance.setZoom('month');
    fixture.componentInstance.stepZoom(5);
    expect(fixture.componentInstance.zoom()).toBe('day');
  });

  it('leaves the scroll alone without a today line', async () => {
    const fixture = TestBed.createComponent(TxGanttChart);
    fixture.componentRef.setInput('tasks', [{ id: 'a', label: 'Long', start: '2026-01-01', end: '2026-06-30' }]);
    fixture.componentRef.setInput('today', null);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tx-gantt-chart__today')).toBeNull();
    expect(fixture.nativeElement.querySelector('.tx-gantt-chart__scroll').scrollLeft).toBe(0);
  });

  it('starts scrolled to today when today is far along the range', async () => {
    const fixture = TestBed.createComponent(TxGanttChart);
    fixture.componentRef.setInput('tasks', [{ id: 'a', label: 'Long', start: '2026-01-01', end: '2026-06-30' }]);
    fixture.componentRef.setInput('today', '2026-06-01');
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tx-gantt-chart__scroll').scrollLeft).toBeGreaterThanOrEqual(0);
  });
});

describe('TxGanttChart fit and sub-rows', () => {
  it('stretches a short range to the visible width and stops on destroy', async () => {
    const callbacks: (() => void)[] = [];
    const disconnect = vi.fn();
    const view = window as unknown as Record<string, unknown>;
    view['ResizeObserver'] = class {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe = vi.fn();
      disconnect = disconnect;
    };
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    try {
      const fixture = TestBed.createComponent(TxGanttChart);
      fixture.componentRef.setInput('tasks', [{ id: 'a', label: 'Short', start: '2026-03-02', end: '2026-03-04' }]);
      fixture.componentRef.setInput('zoom', 'day');
      fixture.componentRef.setInput('padding', 0);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const chart = fixture.componentInstance;
      expect(chart.viewport()).toBe(1000);
      expect(chart.width()).toBe(1000);
      expect(chart.dataRange()).toEqual([new Date(2026, 2, 2).getTime(), new Date(2026, 2, 5).getTime()]);
      expect(fixture.nativeElement.querySelector('.tx-gantt-chart__scroll').getAttribute('aria-label')).toContain('Mar 2, 2026 – Mar 4, 2026');
      width.mockReturnValue(400);
      callbacks.forEach((callback) => callback());
      await fixture.whenStable();
      expect(chart.width()).toBe(400);
      fixture.destroy();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      width.mockRestore();
      delete view['ResizeObserver'];
    }
  });

  it('gives overlapping tasks of a timeline lane their own sub-rows', async () => {
    const fixture = TestBed.createComponent(TxGanttChart);
    fixture.componentRef.setInput('layout', 'timeline');
    fixture.componentRef.setInput('tasks', [
      { id: 'a', label: 'Deal A', start: '2026-03-02', end: '2026-03-10', group: 'Ann' },
      { id: 'b', label: 'Deal B', start: '2026-03-05', end: '2026-03-12', group: 'Ann' },
      { id: 'c', label: 'Deal C', start: '2026-03-04', end: '2026-03-06', group: 'Ben' },
    ]);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('.tx-gantt-chart__row')) as HTMLElement[];
    expect(rows.map((row) => row.style.getPropertyValue('--tx-gantt-chart-lanes'))).toEqual(['2', '']);
    const bar = (id: string) => fixture.nativeElement.querySelector(`[data-task="${id}"]`) as HTMLElement;
    expect(bar('a').style.getPropertyValue('--tx-gantt-chart-lane')).toBe('');
    expect(bar('b').style.getPropertyValue('--tx-gantt-chart-lane')).toBe('1');
  });
});

describe('TxGanttChart recompiled by TestBed', () => {
  it('still renders its bars when a test overrides the component', async () => {
    TestBed.overrideComponent(TxGanttChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-gantt-chart__bar').length).toBeGreaterThan(0);
  });
});

@Component({
  imports: [TxGanttChart],
  template: `
    <tx-gantt-chart
      [tasks]="tasks"
      zoom="day"
      [today]="null"
      [showDependencies]="show()"
      [dependencyHighlight]="highlight()"
      [pt]="{ dependency: { class: 'own-link' } }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DependencyHost {
  readonly tasks: TxGanttTask[] = [
    { id: 'a', label: 'Brief', start: '2026-03-02', end: '2026-03-04', group: 'Design' },
    { id: 'b', label: 'Mockups', start: '2026-03-05', end: '2026-03-11', group: 'Design', dependsOn: ['a'] },
    { id: 'c', label: 'API', start: '2026-03-06', end: '2026-03-20', group: 'Build', dependsOn: [{ id: 'b', type: 'start-to-start' }, 'nope'] },
    { id: 'd', label: 'Docs', start: '2026-03-09', end: '2026-03-20', group: 'Build', dependsOn: [{ id: 'c', type: 'finish-to-finish' }] },
    { id: 'e', label: 'Launch', start: '2026-03-23', milestone: true, dependsOn: ['d', { id: 'a', type: 'start-to-finish' }] },
    { id: 'f', label: 'Notes', start: '2026-03-02', end: '2026-03-03', group: 'Build' },
  ];
  readonly show = signal(true);
  readonly highlight = signal(true);
}

describe('TxGanttChart dependencies', () => {
  let fixture: ComponentFixture<DependencyHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const dimmed = () => all('[data-task].tx-gantt-chart__task--dimmed').map((bar) => bar.dataset['task']);
  const active = () => all('.tx-gantt-chart__dependency--active').length;

  beforeEach(async () => {
    fixture = TestBed.createComponent(DependencyHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('draws an arrow per valid dependency in a layer sized in rows', () => {
    const svg = el('.tx-gantt-chart__dependencies');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('viewBox')).toMatch(/^0 0 \d+ 8$/);
    expect(svg.style.height).toBe('calc(var(--tx-gantt-chart-row-height) * 8)');
    const links = all('.tx-gantt-chart__dependency');
    expect(links).toHaveLength(5);
    expect(links[0].classList).toContain('own-link');
    expect(links[0].querySelector('.tx-gantt-chart__dependency-line')?.getAttribute('d')).toMatch(/^M/);
    expect(links[0].querySelector('.tx-gantt-chart__dependency-head')?.getAttribute('d')).toMatch(/Z$/);
  });

  it('names what a task depends on and what depends on it', () => {
    expect(el('[data-task="b"]').getAttribute('aria-label')).toContain('Depends on: Brief, Required by: API (start to start)');
    expect(el('[data-task="d"]').getAttribute('aria-label')).toContain('Depends on: API (finish to finish), Required by: Launch');
    expect(el('[data-task="e"]').getAttribute('aria-label')).toContain('Depends on: Docs, Brief (start to finish)');
    expect(el('[data-task="f"]').getAttribute('aria-label')).not.toContain('Depends on');
  });

  it('lights up the chain of a hovered or focused task and dims the rest', async () => {
    expect(dimmed()).toEqual([]);
    el('[data-task="c"]').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(dimmed()).toEqual(['f']);
    expect(active()).toBe(4);
    expect(all('.tx-gantt-chart__dependency--dimmed')).toHaveLength(1);
    el('[data-task="c"]').dispatchEvent(new MouseEvent('mouseleave'));
    el('[data-task="b"]').dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();
    expect(dimmed()).toEqual(['f']);
    el('[data-task="b"]').dispatchEvent(new FocusEvent('blur'));
    el('[data-task="f"]').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(dimmed()).toEqual([]);
    el('[data-task="f"]').dispatchEvent(new MouseEvent('mouseleave'));
    el('[data-task="d"]').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(dimmed()).toEqual(['f']);
    expect(all('.tx-gantt-chart__dependency--dimmed')).toHaveLength(1);
    expect(all('.tx-gantt-chart__dependency').pop()?.classList).toContain('tx-gantt-chart__dependency--active');
    expect(all('.tx-gantt-chart__summary--dimmed')).toHaveLength(0);
    expect(all('.tx-gantt-chart__bar-label--outside.tx-gantt-chart__task--dimmed')).toHaveLength(1);
  });

  it('dims the summary of a group outside the chain and moves arrows of a folded group to it', async () => {
    const chart = fixture.debugElement.query(By.directive(TxGanttChart)).componentInstance as TxGanttChart;
    chart.hovered.set('a');
    await fixture.whenStable();
    expect(chart.isGroupDimmed('Design')).toBe(false);
    expect(chart.isGroupDimmed(null)).toBe(false);
    chart.hovered.set(null);
    const toggle = all('.tx-gantt-chart__toggle')[0];
    toggle.click();
    await fixture.whenStable();
    expect(all('.tx-gantt-chart__dependency')).toHaveLength(4);
    chart.hovered.set('f');
    chart.active.set('d');
    await fixture.whenStable();
    expect(all('.tx-gantt-chart__summary--dimmed')).toHaveLength(0);
  });

  it('turns the highlight and the arrows off', async () => {
    fixture.componentInstance.highlight.set(false);
    await fixture.whenStable();
    el('[data-task="c"]').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(dimmed()).toEqual([]);
    expect(active()).toBe(0);
    fixture.componentInstance.highlight.set(true);
    fixture.componentInstance.show.set(false);
    await fixture.whenStable();
    expect(el('.tx-gantt-chart__dependencies')).toBeNull();
    expect(dimmed()).toEqual([]);
  });
});

describe('TxGanttChart dependency summaries', () => {
  it('dims the summary bars of groups outside the chain', async () => {
    const fixture = TestBed.createComponent(TxGanttChart);
    fixture.componentRef.setInput('tasks', [
      { id: 'a', label: 'A', start: '2026-03-02', group: 'One' },
      { id: 'b', label: 'B', start: '2026-03-04', group: 'One', dependsOn: ['a'] },
      { id: 'c', label: 'C', start: '2026-03-04', group: 'Two' },
    ]);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    fixture.componentInstance.onBarHover(fixture.componentInstance.spans()[0]);
    await fixture.whenStable();
    const summaries = Array.from(fixture.nativeElement.querySelectorAll('.tx-gantt-chart__summary')) as HTMLElement[];
    expect(summaries.map((summary) => summary.classList.contains('tx-gantt-chart__summary--dimmed'))).toEqual([false, true]);
    fixture.componentInstance.onBarHover(null);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.tx-gantt-chart__summary--dimmed')).toHaveLength(0);
  });
});
