import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { heatmapCalendar } from './heatmap-calendar';
import { TxHeatmapCellView } from './heatmap-cell.component';
import { heatmapLevel, heatmapRowGroups, heatmapScale } from './heatmap-layout';
import { TxHeatmapRowHeader, TxHeatmapRowValue } from './heatmap-templates.directive';
import { TxHeatmap } from './heatmap.component';
import { TxHeatmapCell, TxHeatmapCellClick, TxHeatmapColumnGroup, TxHeatmapLegendItem, TxHeatmapRow } from './heatmap.types';

const GROUPS: TxHeatmapColumnGroup[] = [
  { key: 'w1', label: 'Week 1', columns: [{ key: 'mon', label: 'M' }, { key: 'tue', label: 'T' }] },
  { key: 'w2', label: 'Week 2', columns: [{ key: 'mon2', label: 'M' }] },
];

@Component({
  imports: [TxHeatmap, TxHeatmapRowHeader, TxHeatmapRowValue],
  template: `
    <tx-heatmap
      id="main"
      [groups]="groups"
      [rows]="rows()"
      [legend]="legend"
      [labels]="{ rowHeader: 'Person', valueHeader: 'Rate' }"
      maxHeight="200px"
      [dt]="{ heatmap: { leadWidth: '80px' } }"
      [pt]="{ cell: { class: 'own-cell' } }"
      (cellClick)="clicks.push($event)"
    >
      <ng-template txHeatmapRowHeader let-row><b class="own-head">{{ row.key }}</b></ng-template>
      <ng-template txHeatmapRowValue let-row><i class="own-value">{{ row.data }}</i></ng-template>
    </tx-heatmap>
    <tx-heatmap id="plain" [groups]="groups" [rows]="rows()" unstyled />
    <tx-heatmap id="scale" [groups]="groups" [rows]="valueRows" [scaleSteps]="4" [legend]="scaleLegend" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly groups = GROUPS;
  readonly rows = signal<TxHeatmapRow[]>([
    {
      key: 'Ann',
      data: '90%',
      cells: [
        { tone: 'success', tooltip: 'Mon: on time', interactive: true, data: 1 },
        { tone: 'danger', ariaLabel: 'Tue: late' },
        null,
      ],
    },
    { key: 'Bob', data: '50%', cells: [{ tone: 'info' }, { tone: 'pending', tooltip: 'Due' }] },
  ]);
  readonly legend: TxHeatmapLegendItem[] = [
    { tone: 'success', label: 'On time' },
    { tone: 'danger', label: 'Late' },
  ];
  readonly valueRows: TxHeatmapRow[] = [{ key: 'r', cells: [{ value: 0 }, { value: 2 }, { value: 8 }] }];
  readonly scaleLegend: TxHeatmapLegendItem[] = [{ value: 8, label: '8+' }];
  readonly clicks: TxHeatmapCellClick[] = [];
}

describe('heatmap layout', () => {
  it('splits a row of cells into the column groups', () => {
    const groups = heatmapRowGroups([{ tone: 'success' }, null], GROUPS);
    expect(groups.map((group) => group.slots.map((slot) => slot.columnKey))).toEqual([['mon', 'tue'], ['mon2']]);
    expect(groups[0].slots[0].cell?.tone).toBe('success');
    expect(groups[1].slots[0].cell).toBeNull();
  });

  it('builds a value scale and quantizes the level', () => {
    const scale = heatmapScale([{ key: 'a', cells: [{ value: 3 }, { value: 12 }, null] }], 4);
    expect(scale).toEqual({ min: 0, max: 12, steps: 4 });
    expect(heatmapLevel(0, scale)).toBe(0);
    expect(heatmapLevel(1, scale)).toBe(0.25);
    expect(heatmapLevel(6, scale)).toBe(0.5);
    expect(heatmapLevel(12, scale)).toBe(1);
    expect(heatmapLevel(40, scale)).toBe(1);
    expect(heatmapLevel(null, scale)).toBe(0);
    expect(heatmapScale([], 5, 10, 20)).toEqual({ min: 10, max: 20, steps: 5 });
    expect(heatmapLevel(3, { min: 0, max: 0, steps: 4 })).toBe(1);
  });

  it('lays out a calendar by weeks and weekdays', () => {
    const calendar = heatmapCalendar([{ date: '2026-03-04', value: 5 }], { from: '2026-03-02', to: '2026-04-12', intl: 'en-US' });
    expect(calendar.rows).toHaveLength(7);
    expect(calendar.rows.map((row) => row.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(calendar.groups.map((group) => group.label)).toEqual(['Mar', 'Apr']);
    expect(calendar.groups.reduce((sum, group) => sum + group.columns.length, 0)).toBe(6);
    expect(calendar.rows[2].cells[0]?.value).toBe(5);
    expect(calendar.rows[2].cells[0]?.ariaLabel).toBe('Mar 4, 2026: 5');
    expect(calendar.rows[0].cells[1]?.value).toBe(0);
  });

  it('hides the days outside the range and honours the first day of the week', () => {
    const calendar = heatmapCalendar([], { from: '2026-03-04', to: '2026-03-10', firstDayOfWeek: 0, interactive: true });
    expect(calendar.rows[0].label).toBe('Sun');
    expect(calendar.rows[0].cells[0]?.hidden).toBe(true);
    expect(calendar.rows[3].cells[0]?.hidden).toBeUndefined();
    expect(calendar.rows[3].cells[0]?.interactive).toBe(true);
    expect(calendar.rows[3].cells[0]?.data).toBe('2026-03-04');
  });

  it('takes local dates and builds no weeks for a reversed range', () => {
    const calendar = heatmapCalendar([{ date: new Date(2026, 2, 4), value: 3 }], { from: new Date(2026, 2, 2), to: new Date(2026, 2, 8) });
    expect(calendar.rows[2].cells[0]?.value).toBe(3);
    expect(calendar.groups.reduce((sum, group) => sum + group.columns.length, 0)).toBe(1);
    const reversed = heatmapCalendar([], { from: '2026-03-10', to: '2026-03-02' });
    expect(reversed.groups).toEqual([]);
    expect(reversed.rows.every((row) => row.cells.length === 0)).toBe(true);
  });
});

describe('heatmap template directives', () => {
  it('narrow any given context to the row context', () => {
    expect(TxHeatmapRowHeader.ngTemplateContextGuard(new TxHeatmapRowHeader(), { row: {} })).toBe(true);
    expect(TxHeatmapRowValue.ngTemplateContextGuard(new TxHeatmapRowValue(), null)).toBe(false);
  });
});

@Component({
  imports: [TxHeatmapCellView],
  template: `<tx-heatmap-cell [cell]="cell()" [level]="level()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CellHost {
  readonly cell = signal<TxHeatmapCell | null>(null);
  readonly level = signal<number | null>(null);
}

describe('TxHeatmapCellView', () => {
  let fixture: ComponentFixture<CellHost>;
  const box = () => fixture.nativeElement.querySelector('.tx-heatmap-cell__box') as HTMLElement;
  const kind = () => [...box().classList].find((name) => /__box--(empty|hidden|scale|success)$/.test(name));

  beforeEach(async () => {
    fixture = TestBed.createComponent(CellHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('draws an empty, unlabelled box without a cell', () => {
    expect(kind()).toBe('tx-heatmap-cell__box--empty');
    expect(box().getAttribute('aria-hidden')).toBe('true');
    expect(box().hasAttribute('aria-label')).toBe(false);
    expect((fixture.debugElement.query(By.directive(TxHeatmapCellView)).componentInstance as TxHeatmapCellView).label()).toBeNull();
  });

  it('hides a hidden cell', async () => {
    fixture.componentInstance.cell.set({ hidden: true, tone: 'success' });
    await fixture.whenStable();
    expect(kind()).toBe('tx-heatmap-cell__box--hidden');
  });

  it('keeps a value without a level and a cell without a tone empty', async () => {
    fixture.componentInstance.cell.set({ value: 3 });
    await fixture.whenStable();
    expect(kind()).toBe('tx-heatmap-cell__box--empty');
    expect(box().style.getPropertyValue('--tx-heatmap-level')).toBe('');
    fixture.componentInstance.cell.set({ ariaLabel: 'Nothing' });
    await fixture.whenStable();
    expect(kind()).toBe('tx-heatmap-cell__box--empty');
    expect(box().getAttribute('aria-label')).toBe('Nothing');
  });
});

describe('TxHeatmap', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const main = () => fixture.nativeElement.querySelector('#main') as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the head, the groups and a row per item with templates', () => {
    expect(main().querySelector('.tx-heatmap__lead--head')?.textContent?.trim()).toBe('Person');
    expect(main().querySelector('.tx-heatmap__value--head')?.textContent?.trim()).toBe('Rate');
    expect([...main().querySelectorAll('.tx-heatmap__group-label')].map((label) => label.textContent?.trim())).toEqual(['Week 1', 'Week 2']);
    expect([...main().querySelectorAll('.own-head')].map((head) => head.textContent)).toEqual(['Ann', 'Bob']);
    expect([...main().querySelectorAll('.own-value')].map((value) => value.textContent)).toEqual(['90%', '50%']);
    const scroll = main().querySelector('.tx-heatmap__scroll') as HTMLElement;
    expect(scroll.getAttribute('role')).toBe('region');
    expect(scroll.getAttribute('aria-label')).toBe('Heatmap');
    expect(scroll.style.maxHeight).toBe('200px');
  });

  it('draws tones, empty slots and accessible names', () => {
    const boxes = [...main().querySelectorAll<HTMLElement>('.tx-heatmap__row:not(.tx-heatmap__row--head) .tx-heatmap-cell__box')];
    expect(boxes.map((box) => [...box.classList].find((name) => /--(success|danger|info|pending|empty)$/.test(name)))).toEqual([
      'tx-heatmap-cell__box--success',
      'tx-heatmap-cell__box--danger',
      'tx-heatmap-cell__box--empty',
      'tx-heatmap-cell__box--info',
      'tx-heatmap-cell__box--pending',
      'tx-heatmap-cell__box--empty',
    ]);
    expect(boxes[0].tagName).toBe('BUTTON');
    expect(boxes[0].getAttribute('aria-label')).toBe('Mon: on time');
    expect(boxes[1].getAttribute('role')).toBe('img');
    expect(boxes[1].getAttribute('aria-label')).toBe('Tue: late');
    expect(boxes[3].getAttribute('aria-hidden')).toBe('true');
    expect(boxes[2].getAttribute('aria-hidden')).toBe('true');
    expect(boxes[0].classList).toContain('own-cell');
  });

  it('emits cellClick only for interactive cells', () => {
    (main().querySelector('button.tx-heatmap-cell__box') as HTMLButtonElement).click();
    expect(host.clicks).toHaveLength(1);
    expect(host.clicks[0].columnKey).toBe('mon');
    expect(host.clicks[0].row.key).toBe('Ann');
    expect(host.clicks[0].cell.data).toBe(1);
  });

  it('shows the legend with the empty item', () => {
    const items = [...main().querySelectorAll('.tx-heatmap-legend__item')].map((item) => item.textContent?.trim());
    expect(items).toEqual(['On time', 'Late', 'No data']);
  });

  it('colours value cells by the scale', () => {
    const scale = fixture.nativeElement.querySelector('#scale') as HTMLElement;
    const boxes = [...scale.querySelectorAll<HTMLElement>('.tx-heatmap__row:not(.tx-heatmap__row--head) .tx-heatmap-cell__box')];
    expect(boxes[0].classList).toContain('tx-heatmap-cell__box--empty');
    expect(boxes[1].classList).toContain('tx-heatmap-cell__box--scale');
    expect(boxes[1].style.getPropertyValue('--tx-heatmap-level')).toBe('25%');
    expect(boxes[2].style.getPropertyValue('--tx-heatmap-level')).toBe('100%');
    expect(scale.querySelector('.tx-heatmap-legend .tx-heatmap-cell__box')?.classList).toContain('tx-heatmap-cell__box--scale');
  });

  it('applies dt and unstyled', () => {
    expect(main().style.getPropertyValue('--tx-chart-heatmap-lead-width')).toBe('80px');
    expect(main().hasAttribute('data-styled')).toBe(true);
    const plain = fixture.nativeElement.querySelector('#plain') as HTMLElement;
    expect(plain.hasAttribute('data-styled')).toBe(false);
    expect(plain.querySelector('tx-heatmap-cell')?.hasAttribute('data-styled')).toBe(false);
  });
});

@Component({
  imports: [TxHeatmap, TxHeatmapRowHeader, TxHeatmapRowValue],
  template: `
    <tx-heatmap [groups]="groups" [rows]="rows" [legend]="legend" [labels]="{ empty: '' }">
      <ng-template txHeatmapRowHeader let-row><b class="own-head">{{ row.key }}</b></ng-template>
      <ng-template txHeatmapRowValue let-row><i class="own-value">{{ row.data }}</i></ng-template>
    </tx-heatmap>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LabelsHost {
  readonly groups = GROUPS;
  readonly rows: TxHeatmapRow[] = [{ key: 'Ann', data: '90%', cells: [{ tone: 'success' }] }];
  readonly legend: TxHeatmapLegendItem[] = [{ tone: 'success', label: 'On time' }];
}

describe('TxHeatmap labels', () => {
  it('drops the empty legend item without an empty label', async () => {
    const fixture = TestBed.createComponent(LabelsHost);
    await fixture.whenStable();
    expect([...fixture.nativeElement.querySelectorAll('.tx-heatmap-legend__item')].map((item: Element) => item.textContent?.trim())).toEqual(['On time']);
  });

  it('still renders its row templates when a test overrides the component', async () => {
    TestBed.overrideComponent(TxHeatmap, { set: { styles: [] } });
    const fixture = TestBed.createComponent(LabelsHost);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.own-head')?.textContent).toBe('Ann');
    expect(fixture.nativeElement.querySelector('.own-value')?.textContent).toBe('90%');
  });
});
