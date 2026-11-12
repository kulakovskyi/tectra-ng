import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxDatePicker } from './datepicker.component';
import {
  TxDatePickerButtonBar,
  TxDatePickerDate,
  TxDatePickerDecade,
  TxDatePickerFooter,
  TxDatePickerHeader,
  TxDatePickerInputIcon,
  TxDatePickerTriggerIcon,
} from './datepicker.templates';
import { TxDatePickerDataType, TxDatePickerIconDisplay, TxDatePickerMonthChangeEvent, TxDatePickerSelectionMode, TxDatePickerValue, TxDatePickerView } from './datepicker.types';

@Component({
  imports: [TxDatePicker, TxDatePickerDate, ReactiveFormsModule],
  template: `
    <tx-datepicker
      id="picker"
      dateFormat="dd.mm.yy"
      placeholder="Pick a date"
      [firstDayOfWeek]="1"
      [formControl]="control"
      [selectionMode]="mode()"
      [showIcon]="true"
      [showClear]="true"
      [showButtonBar]="buttonBar()"
      [showTime]="showTime()"
      [showWeek]="showWeek()"
      [view]="view()"
      [dataType]="dataType()"
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      [maxDateCount]="2"
      [disabledDays]="disabledDays()"
      [inline]="inline()"
      [dt]="{ panel: { padding: '20px' } }"
      [pt]="{ panel: { class: 'own-panel' }, day: { class: 'own-day' } }"
      (selected)="picked.push($event)"
      (monthChange)="months.push($event.month)"
    >
      <ng-template txDatePickerDate let-day let-selected="selected"><b class="cell" [class.on]="selected">{{ day.day }}</b></ng-template>
    </tx-datepicker>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  control = new FormControl<TxDatePickerValue>(new Date(2026, 9, 15));
  readonly mode = signal<TxDatePickerSelectionMode>('single');
  readonly buttonBar = signal(false);
  readonly showTime = signal(false);
  readonly showWeek = signal(false);
  readonly view = signal<TxDatePickerView>('date');
  readonly dataType = signal<TxDatePickerDataType>('date');
  readonly minDate = signal<Date | null>(null);
  readonly maxDate = signal<Date | null>(null);
  readonly disabledDays = signal<number[] | null>(null);
  readonly inline = signal(false);
  picked: Date[] = [];
  months: number[] = [];
}

@Component({
  imports: [TxDatePicker, ReactiveFormsModule, TxDatePickerHeader, TxDatePickerFooter, TxDatePickerDecade, TxDatePickerButtonBar, TxDatePickerTriggerIcon, TxDatePickerInputIcon],
  template: `
    <tx-datepicker dateFormat="dd.mm.yy" [formControl]="control" [inline]="inline()" [showIcon]="true" [iconDisplay]="iconDisplay()" [showButtonBar]="true">
      <ng-template txDatePickerHeader><p class="own-header">Header</p></ng-template>
      <ng-template txDatePickerFooter><p class="own-footer">Footer</p></ng-template>
      <ng-template txDatePickerDecade let-years><span class="own-decade">{{ years[0] }}s</span></ng-template>
      <ng-template txDatePickerButtonBar let-today="today" let-clear="clear">
        <button type="button" class="own-today" (click)="today()">Now</button>
        <button type="button" class="own-clear" (click)="clear()">Reset</button>
      </ng-template>
      <ng-template txDatePickerTriggerIcon><i class="own-trigger"></i></ng-template>
      <ng-template txDatePickerInputIcon><i class="own-input-icon"></i></ng-template>
    </tx-datepicker>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplatesHost {
  readonly control = new FormControl<TxDatePickerValue>(new Date(2026, 9, 1));
  readonly inline = signal(false);
  readonly iconDisplay = signal<TxDatePickerIconDisplay>('button');
}

@Component({
  imports: [TxDatePicker],
  template: `<div class="scroller" style="overflow: auto; height: 40px"><tx-datepicker dateFormat="dd.mm.yy" /></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ScrollHost {}

class FakeQuery extends EventTarget {
  removed = 0;
  constructor(
    readonly media: string,
    public matches: boolean,
  ) {
    super();
  }
  override removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null): void {
    this.removed++;
    super.removeEventListener(type, callback);
  }
}

describe('TxDatePicker', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const render = () => fixture.detectChanges();
  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const panel = () => document.querySelector('.tx-datepicker__panel') as HTMLElement | null;
  const cell = (iso: string) => document.querySelector(`[data-date="${iso}"]`) as HTMLElement;
  const key = (target: HTMLElement, name: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
    render();
  };
  const type = (text: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    render();
  };
  const settle = async () => {
    render();
    await fixture.whenStable();
    render();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()));

  it('shows the value in the field format and links ARIA', () => {
    expect(input().value).toBe('15.10.2026');
    expect(input().getAttribute('role')).toBe('combobox');
    expect(input().getAttribute('aria-haspopup')).toBe('dialog');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(input().getAttribute('placeholder')).toBe('Pick a date');
    expect(fixture.nativeElement.querySelector('#picker').classList).toContain('tx-datepicker--filled');
  });

  it('parses typed dates, keeps the draft until blur and clears an empty field', () => {
    type('3.11.2026');
    expect((host.control.value as Date).getTime()).toBe(new Date(2026, 10, 3).getTime());
    expect(input().value).toBe('3.11.2026');
    input().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(input().value).toBe('03.11.2026');
    type('31.02.2026');
    expect((host.control.value as Date).getDate()).toBe(3);
    input().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(input().value).toBe('03.11.2026');
    type('');
    expect(host.control.value).toBeNull();
  });

  it('opens on focus, picks a day and closes', async () => {
    input().dispatchEvent(new FocusEvent('focus'));
    await settle();
    expect(panel()?.getAttribute('role')).toBe('dialog');
    expect(panel()?.classList).toContain('own-panel');
    expect(panel()?.style.getPropertyValue('--tx-date-picker-panel-padding')).toBe('20px');
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelectorAll('.tx-datepicker__weekday')[0].textContent?.trim()).toBe('Mo');
    expect(cell('2026-10-15').getAttribute('aria-selected')).toBe('true');
    expect(cell('2026-10-15').querySelector('.cell.on')).not.toBeNull();
    expect(cell('2026-10-15').querySelector('.own-day')).not.toBeNull();
    cell('2026-10-20').click();
    await settle();
    expect((host.control.value as Date).getDate()).toBe(20);
    expect(host.picked).toHaveLength(1);
    expect(input().value).toBe('20.10.2026');
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('walks the grid with the keyboard', async () => {
    key(input(), 'ArrowDown');
    await settle();
    const active = () => document.querySelector('[data-active="true"]') as HTMLElement;
    expect(active().getAttribute('data-date')).toBe('2026-10-15');
    key(active(), 'ArrowRight');
    expect(active().getAttribute('data-date')).toBe('2026-10-16');
    key(active(), 'ArrowDown');
    expect(active().getAttribute('data-date')).toBe('2026-10-23');
    key(active(), 'Home');
    expect(active().getAttribute('data-date')).toBe('2026-10-19');
    key(active(), 'End');
    expect(active().getAttribute('data-date')).toBe('2026-10-25');
    key(active(), 'PageDown');
    expect(active().getAttribute('data-date')).toBe('2026-11-25');
    expect(host.months).toContain(11);
    key(active(), 'PageUp', { shiftKey: true });
    expect(active().getAttribute('data-date')).toBe('2025-11-25');
    key(active(), 'Enter');
    await settle();
    expect((host.control.value as Date).getFullYear()).toBe(2025);
    expect(input().getAttribute('aria-expanded')).toBe('false');
    key(input(), 'ArrowDown');
    await settle();
    key(document.querySelector('[data-active="true"]') as HTMLElement, 'Escape');
    await settle();
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('selects a range and restarts it before the start', async () => {
    host.mode.set('range');
    host.control.setValue(null);
    await settle();
    key(input(), 'ArrowDown');
    await settle();
    const today = new Date();
    const iso = (day: number) => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cell(iso(10)).click();
    await settle();
    expect(host.control.value).toEqual([new Date(today.getFullYear(), today.getMonth(), 10), null]);
    cell(iso(14)).click();
    await settle();
    expect((host.control.value as Date[])[1].getDate()).toBe(14);
    expect(input().value).toContain(' - ');
    key(input(), 'ArrowDown');
    await settle();
    expect(cell(iso(12)).getAttribute('aria-selected')).toBe('true');
    expect(cell(iso(12)).querySelector('.tx-datepicker__day--range')).not.toBeNull();
    cell(iso(5)).click();
    await settle();
    expect(host.control.value).toEqual([new Date(today.getFullYear(), today.getMonth(), 5), null]);
    cell(iso(9)).dispatchEvent(new MouseEvent('mouseenter'));
    render();
    expect(document.querySelectorAll('.tx-datepicker__day--preview')).toHaveLength(4);
    expect(cell(iso(7)).getAttribute('aria-selected')).toBe('false');
    cell(iso(3)).dispatchEvent(new MouseEvent('mouseenter'));
    render();
    expect(document.querySelectorAll('.tx-datepicker__day--preview')).toHaveLength(0);
    cell(iso(9)).dispatchEvent(new MouseEvent('mouseenter'));
    render();
    (document.querySelector('.tx-datepicker__day-view') as HTMLElement).dispatchEvent(new MouseEvent('mouseleave'));
    render();
    expect(document.querySelectorAll('.tx-datepicker__day--preview')).toHaveLength(0);
  });

  it('previews the range from the keyboard and picks days of other months', async () => {
    host.mode.set('range');
    host.control.setValue([new Date(2026, 9, 28), null]);
    await settle();
    key(input(), 'ArrowDown');
    await settle();
    const active = () => document.querySelector('[data-active="true"]') as HTMLElement;
    key(active(), 'ArrowRight');
    key(active(), 'ArrowRight');
    expect(document.querySelectorAll('.tx-datepicker__day--preview')).toHaveLength(2);
    const other = cell('2026-11-01');
    expect(other.classList).toContain('tx-datepicker__day-cell--other');
    expect(other.getAttribute('aria-disabled')).toBeNull();
    other.click();
    await settle();
    expect(host.control.value).toEqual([new Date(2026, 9, 28), new Date(2026, 10, 1)]);
  });

  it('collects multiple dates up to the limit', async () => {
    host.mode.set('multiple');
    host.control.setValue(null);
    await settle();
    key(input(), 'ArrowDown');
    await settle();
    const days = [...document.querySelectorAll<HTMLElement>('.tx-datepicker__day-cell:not(.tx-datepicker__day-cell--other)')];
    days[1].click();
    days[2].click();
    days[3].click();
    await settle();
    expect((host.control.value as Date[]).length).toBe(2);
    days[1].click();
    await settle();
    expect((host.control.value as Date[]).length).toBe(1);
  });

  it('blocks dates outside the limits', async () => {
    host.minDate.set(new Date(2026, 9, 10));
    host.maxDate.set(new Date(2026, 9, 20));
    host.disabledDays.set([0]);
    await settle();
    key(input(), 'ArrowDown');
    await settle();
    expect(cell('2026-10-05').getAttribute('aria-disabled')).toBe('true');
    expect(cell('2026-10-18').getAttribute('aria-disabled')).toBe('true');
    cell('2026-10-05').click();
    await settle();
    expect((host.control.value as Date).getDate()).toBe(15);
    type('25.10.2026');
    expect((host.control.value as Date).getDate()).toBe(15);
  });

  it('switches to month and year views', async () => {
    key(input(), 'ArrowDown');
    await settle();
    (document.querySelector('.tx-datepicker__select-month') as HTMLElement).click();
    await settle();
    expect(panel()?.getAttribute('data-view')).toBe('month');
    expect(document.querySelectorAll('.tx-datepicker__month')).toHaveLength(12);
    (document.querySelector('.tx-datepicker__select-year') as HTMLElement).click();
    await settle();
    expect(document.querySelectorAll('.tx-datepicker__year')).toHaveLength(10);
    (document.querySelectorAll('.tx-datepicker__year')[2] as HTMLElement).click();
    await settle();
    (document.querySelectorAll('.tx-datepicker__month')[0] as HTMLElement).click();
    await settle();
    expect(panel()?.getAttribute('data-view')).toBe('date');
    expect(cell('2022-01-15')).not.toBeNull();
  });

  it('picks a month when the view is month', async () => {
    host.view.set('month');
    await settle();
    key(input(), 'ArrowDown');
    await settle();
    (document.querySelectorAll('.tx-datepicker__month')[3] as HTMLElement).click();
    await settle();
    expect(host.control.value).toEqual(new Date(2026, 3, 1));
  });

  it('changes time with the spinners and keeps it on the date', async () => {
    host.showTime.set(true);
    host.control.setValue(new Date(2026, 9, 15, 9, 30));
    await settle();
    expect(input().value).toBe('15.10.2026 09:30');
    key(input(), 'ArrowDown');
    await settle();
    const component = fixture.debugElement.children[0].componentInstance as TxDatePicker;
    component.shiftTime('hour', 1);
    component.shiftTime('minute', -1);
    await settle();
    expect((host.control.value as Date).getHours()).toBe(10);
    expect((host.control.value as Date).getMinutes()).toBe(29);
    cell('2026-10-16').click();
    await settle();
    expect(host.control.value).toEqual(new Date(2026, 9, 16, 10, 29));
    expect(input().getAttribute('aria-expanded')).toBe('true');
    type('17.10.2026 18:05');
    expect(host.control.value).toEqual(new Date(2026, 9, 17, 18, 5));
  });

  it('works with string values', async () => {
    host.dataType.set('string');
    host.control.setValue('01.02.2026');
    await settle();
    expect(input().value).toBe('01.02.2026');
    key(input(), 'ArrowDown');
    await settle();
    cell('2026-02-03').click();
    await settle();
    expect(host.control.value).toBe('03.02.2026');
  });

  it('selects today and clears from the button bar and the clear icon', async () => {
    host.buttonBar.set(true);
    await settle();
    key(input(), 'ArrowDown');
    await settle();
    const [today, clear] = [...document.querySelectorAll<HTMLButtonElement>('.tx-datepicker__buttonbar button')];
    today.click();
    await settle();
    expect((host.control.value as Date).toDateString()).toBe(new Date().toDateString());
    key(input(), 'ArrowDown');
    await settle();
    (document.querySelectorAll<HTMLButtonElement>('.tx-datepicker__buttonbar button')[1] ?? clear).click();
    await settle();
    expect(host.control.value).toBeNull();
    host.control.setValue(new Date(2026, 0, 1));
    await settle();
    (fixture.nativeElement.querySelector('.tx-datepicker__clear') as HTMLButtonElement).click();
    await settle();
    expect(host.control.value).toBeNull();
  });

  it('renders inline with week numbers and no field', async () => {
    host.inline.set(true);
    host.showWeek.set(true);
    await settle();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
    const inline = fixture.nativeElement.querySelector('.tx-datepicker__panel') as HTMLElement;
    expect(inline.getAttribute('role')).toBe('group');
    expect(inline.querySelector('.tx-datepicker__week-number')?.textContent?.trim()).toBe('40');
    (inline.querySelector('.tx-datepicker__next') as HTMLButtonElement).click();
    await settle();
    expect(host.months).toEqual([11]);
  });
});

describe('TxDatePicker interactions', () => {
  let fixture: ComponentFixture<TxDatePicker>;
  let picker: TxDatePicker;
  let changes: TxDatePickerValue[];
  const $ = (selector: string) => document.querySelector(selector) as HTMLElement;
  const $$ = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
  const text = (selector: string) => $$(selector).map((node) => node.textContent?.trim());
  const panel = () => $('.tx-datepicker__panel');
  const active = () => $('.tx-datepicker__panel [data-active="true"]');
  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const cell = (iso: string) => $(`[data-date="${iso}"]`);
  const last = () => changes.at(-1);
  const settle = () => fixture.whenStable();
  const press = async (target: HTMLElement | Document, key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    await settle();
    return event;
  };
  const type = async (value: string) => {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    await settle();
  };
  const setup = async (inputs: Record<string, unknown> = {}, value: TxDatePickerValue = null) => {
    fixture = TestBed.createComponent(TxDatePicker);
    picker = fixture.componentInstance;
    for (const [name, inputValue] of Object.entries({ dateFormat: 'dd.mm.yy', ...inputs })) fixture.componentRef.setInput(name, inputValue);
    changes = [];
    picker.registerOnChange((next) => changes.push(next));
    picker.writeValue(value);
    fixture.autoDetectChanges();
    await settle();
  };
  const open = async () => {
    input().dispatchEvent(new FocusEvent('focus'));
    await settle();
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 15, 10, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('moves through months from the keyboard and picks one', async () => {
    await setup({ inline: true }, new Date(2026, 0, 15));
    const months: TxDatePickerMonthChangeEvent[] = [];
    picker.monthChange.subscribe((event) => months.push(event));
    $('.tx-datepicker__select-month').click();
    await settle();
    expect(panel().getAttribute('data-view')).toBe('month');
    expect(active().getAttribute('aria-label')).toBe('January 2026');
    expect((await press(active(), 'ArrowLeft')).defaultPrevented).toBe(true);
    expect(active().getAttribute('aria-label')).toBe('December 2025');
    await press(active(), 'ArrowRight');
    expect(active().getAttribute('aria-label')).toBe('January 2026');
    await press(active(), 'ArrowDown');
    expect(active().getAttribute('aria-label')).toBe('April 2026');
    await press(active(), 'ArrowUp');
    expect(active().getAttribute('aria-label')).toBe('January 2026');
    expect((await press(active(), 'x')).defaultPrevented).toBe(false);
    await press(active(), 'ArrowRight');
    await press(active(), ' ');
    expect(panel().getAttribute('data-view')).toBe('date');
    expect(months.at(-1)).toEqual({ month: 2, year: 2026 });
    $('.tx-datepicker__select-month').click();
    await settle();
    await press(active(), 'Enter');
    expect(panel().getAttribute('data-view')).toBe('date');
    expect(changes).toEqual([]);
  });

  it('moves through years and decades from the keyboard and the header', async () => {
    await setup({ inline: true }, new Date(2026, 0, 15));
    const years: TxDatePickerMonthChangeEvent[] = [];
    picker.yearChange.subscribe((event) => years.push(event));
    $('.tx-datepicker__select-year').click();
    await settle();
    expect(panel().getAttribute('data-view')).toBe('year');
    expect(active().textContent).toBe('2026');
    await press(active(), 'ArrowDown');
    expect(active().textContent).toBe('2028');
    await press(active(), 'ArrowDown');
    expect(active().textContent).toBe('2030');
    expect(text('.tx-datepicker__decade')).toEqual(['2030 – 2039']);
    await press(active(), 'ArrowUp');
    expect(text('.tx-datepicker__decade')).toEqual(['2020 – 2029']);
    await press(active(), 'ArrowLeft');
    expect(active().textContent).toBe('2027');
    await press(active(), 'ArrowRight');
    expect((await press(active(), 'x')).defaultPrevented).toBe(false);
    $('.tx-datepicker__previous').click();
    await settle();
    expect(text('.tx-datepicker__decade')).toEqual(['2010 – 2019']);
    $('.tx-datepicker__next').click();
    await settle();
    expect(text('.tx-datepicker__decade')).toEqual(['2020 – 2029']);
    await press(active(), 'Enter');
    expect(panel().getAttribute('data-view')).toBe('month');
    expect(years).toEqual([{ month: 1, year: 2028 }]);
    $('.tx-datepicker__previous').click();
    await settle();
    $('.tx-datepicker__next').click();
    await settle();
    expect(years.slice(1)).toEqual([
      { month: 1, year: 2027 },
      { month: 1, year: 2028 },
    ]);
    $('.tx-datepicker__select-year').click();
    await settle();
    await press(active(), ' ');
    expect(panel().getAttribute('data-view')).toBe('month');
  });

  it('only picks months and years inside the limits', async () => {
    await setup({ inline: true, view: 'month', minDate: new Date(2026, 2, 10), maxDate: new Date(2026, 9, 20) });
    const months = $$('.tx-datepicker__month');
    expect(months.map((month) => month.getAttribute('aria-disabled'))).toEqual(['true', 'true', null, null, null, null, null, null, null, null, 'true', 'true']);
    months[0].click();
    months[10].click();
    expect(changes).toEqual([]);
    months[2].click();
    expect(last()).toEqual(new Date(2026, 2, 1));
    fixture.componentRef.setInput('view', 'year');
    await settle();
    const years = $$('.tx-datepicker__year');
    expect(years.filter((year) => year.getAttribute('aria-disabled') === 'true').map((year) => year.textContent)).toEqual(['2020', '2021', '2022', '2023', '2024', '2025', '2027', '2028', '2029']);
    years[5].click();
    expect(changes).toHaveLength(1);
    years[6].click();
    expect(last()).toEqual(new Date(2026, 0, 1));
  });

  it('reports a year change when paging over the turn of the year', async () => {
    await setup({ inline: true }, new Date(2026, 11, 5));
    const years: TxDatePickerMonthChangeEvent[] = [];
    picker.yearChange.subscribe((event) => years.push(event));
    $('.tx-datepicker__next').click();
    await settle();
    $('.tx-datepicker__previous').click();
    await settle();
    expect(years).toEqual([
      { month: 1, year: 2027 },
      { month: 12, year: 2026 },
    ]);
  });

  it('repeats time steps while a spinner is held and steps with the keyboard', async () => {
    await setup({ inline: true, showTime: true, showSeconds: true, hourFormat: '12' }, new Date(2026, 9, 15, 0, 30, 0));
    expect(text('.tx-datepicker__time-value')).toEqual(['12', '30', '00', 'AM']);
    const units = $$('.tx-datepicker__time-unit');
    units[3].querySelector('button')?.click();
    await settle();
    expect(text('.tx-datepicker__time-value')).toEqual(['12', '30', '00', 'PM']);
    const [nextSecond, previousSecond] = [...units[2].querySelectorAll('button')];
    await press(nextSecond, 'Enter');
    await press(nextSecond, ' ');
    await press(previousSecond, 'Enter');
    expect((await press(nextSecond, 'a')).defaultPrevented).toBe(false);
    expect(last()).toEqual(new Date(2026, 9, 15, 12, 30, 1));
    const nextMinute = units[1].querySelector('button') as HTMLButtonElement;
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date(2026, 9, 15, 10, 0));
    const count = changes.length;
    nextMinute.dispatchEvent(new MouseEvent('pointerdown', { button: 2, bubbles: true }));
    expect(changes).toHaveLength(count);
    nextMinute.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true, cancelable: true }));
    expect((last() as Date).getMinutes()).toBe(31);
    vi.advanceTimersByTime(400);
    expect((last() as Date).getMinutes()).toBe(32);
    vi.advanceTimersByTime(160);
    expect((last() as Date).getMinutes()).toBe(34);
    nextMinute.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect((last() as Date).getMinutes()).toBe(34);
    nextMinute.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
    fixture.destroy();
    vi.advanceTimersByTime(1000);
    expect((last() as Date).getMinutes()).toBe(35);
  });

  it('keeps a time without a date and puts it on the picked day', async () => {
    await setup({ inline: true, showTime: true });
    expect(text('.tx-datepicker__time-value')).toEqual(['00', '00']);
    await press($$('.tx-datepicker__time-unit')[0].querySelector('button') as HTMLElement, 'Enter');
    expect(text('.tx-datepicker__time-value')).toEqual(['01', '00']);
    expect(changes).toEqual([]);
    cell('2026-10-20').click();
    await settle();
    expect(last()).toEqual(new Date(2026, 9, 20, 1, 0));
    picker.setDisabledState(true);
    picker.shiftTime('hour', 1);
    cell('2026-10-21').click();
    expect(changes).toHaveLength(1);
  });

  it('shows an empty twelve hour time with seconds', async () => {
    await setup({ inline: true, showTime: true, showSeconds: true, hourFormat: '12' });
    expect(text('.tx-datepicker__time-value')).toEqual(['12', '00', '00', 'AM']);
    expect(picker.showPanel()).toBe(true);
  });

  it('puts the time on the start of an open range', async () => {
    await setup({ inline: true, showTime: true, selectionMode: 'range' }, [new Date(2026, 9, 1, 9, 0), null]);
    picker.shiftTime('hour', 1);
    expect(last()).toEqual([new Date(2026, 9, 1, 10, 0), null]);
  });

  it('selects today with the time of the value', async () => {
    await setup({ inline: true, showTime: true, showButtonBar: true }, new Date(2026, 9, 1, 9, 15));
    const today: Date[] = [];
    picker.todayClicked.subscribe((date) => today.push(date));
    $('.tx-datepicker__buttonbar button').click();
    await settle();
    expect(last()).toEqual(new Date(2026, 9, 15, 9, 15));
    expect(today).toEqual([new Date(2026, 9, 15, 9, 15)]);
    $$('.tx-datepicker__buttonbar button')[1].click();
    await settle();
    expect(last()).toBeNull();
    expect(panel()).not.toBeNull();
  });

  it('shows today without picking it outside the limits', async () => {
    await setup({ inline: true, showButtonBar: true, maxDate: new Date(2026, 9, 10) }, new Date(2026, 5, 1));
    const today: Date[] = [];
    picker.todayClicked.subscribe((date) => today.push(date));
    $('.tx-datepicker__buttonbar button').click();
    await settle();
    expect(today).toEqual([new Date(2026, 9, 15)]);
    expect(changes).toEqual([]);
    expect(text('.tx-datepicker__select-month')).toEqual(['October']);
  });

  it('edits a time only value', async () => {
    await setup({ timeOnly: true, numberOfMonths: 3 });
    expect(picker.months()).toHaveLength(1);
    await press(input(), 'ArrowDown');
    expect(panel().classList).toContain('tx-datepicker__panel--time-only');
    expect($('.tx-datepicker__calendars')).toBeNull();
    await type('10:30');
    expect(last()).toEqual(new Date(2026, 9, 15, 10, 30));
    await type('99:99');
    expect(changes).toHaveLength(1);
    picker.shiftTime('hour', 1);
    await settle();
    expect(input().value).toBe('11:30');
  });

  it('needs a valid time when the field shows one', async () => {
    await setup({ showTime: true });
    await type('17.10.2026');
    await type('17.10.2026 25:00');
    expect(changes).toEqual([]);
    await type('17.10.2026 18:05');
    expect(last()).toEqual(new Date(2026, 9, 17, 18, 5));
  });

  it('parses typed ranges and rejects broken ones', async () => {
    await setup({ selectionMode: 'range' });
    await type('01.10.2026 - 05.10.2026');
    expect(last()).toEqual([new Date(2026, 9, 1), new Date(2026, 9, 5)]);
    await type('07.10.2026');
    expect(last()).toEqual([new Date(2026, 9, 7), null]);
    await type('08.10.2026 - ');
    expect(last()).toEqual([new Date(2026, 9, 8), null]);
    for (const broken of ['09.10.2026 - 01.10.2026', '09.10.2026 - nope', 'nope', '1.10.2026 - 2.10.2026 - 3.10.2026']) await type(broken);
    expect(changes).toHaveLength(3);
    input().dispatchEvent(new FocusEvent('blur'));
    await settle();
    expect(input().value).toBe('08.10.2026');
  });

  it('reads range values with gaps and clears them', async () => {
    await setup({ selectionMode: 'range', showClear: true }, [null, new Date(2026, 9, 5)]);
    expect(input().value).toBe('');
    picker.writeValue([new Date(2026, 9, 3)]);
    await settle();
    expect(input().value).toBe('03.10.2026');
    ($('.tx-datepicker__clear') as HTMLButtonElement).click();
    await settle();
    expect(last()).toBeNull();
    expect(document.activeElement).toBe(input());
  });

  it('parses typed lists up to the limit and deselects the last date', async () => {
    await setup({ selectionMode: 'multiple', maxDateCount: 2 });
    await type('01.10.2026, 02.10.2026, 03.10.2026');
    expect(last()).toEqual([new Date(2026, 9, 1), new Date(2026, 9, 2)]);
    await type('01.10.2026, nope');
    expect(changes).toHaveLength(1);
    fixture.componentRef.setInput('maxDateCount', undefined);
    await type('01.10.2026, 02.10.2026, 03.10.2026');
    expect(last()).toHaveLength(3);
    picker.writeValue([new Date(2026, 9, 4), null, new Date(Number.NaN)]);
    await settle();
    expect(input().value).toBe('04.10.2026');
    await open();
    cell('2026-10-04').click();
    await settle();
    expect(last()).toBeNull();
  });

  it('writes lists of strings', async () => {
    await setup({ selectionMode: 'multiple', dataType: 'string' });
    await type('01.10.2026, 02.10.2026');
    expect(last()).toEqual(['01.10.2026', '02.10.2026']);
    picker.writeValue(['05.10.2026', null]);
    await settle();
    expect(input().value).toBe('05.10.2026');
    picker.writeValue('nope');
    await settle();
    expect(input().value).toBe('');
  });

  it('handles keys on the field', async () => {
    await setup({}, new Date(2026, 9, 15));
    expect((await press(input(), 'Tab')).defaultPrevented).toBe(false);
    expect((await press(input(), 'Escape')).defaultPrevented).toBe(false);
    await press(input(), 'Enter');
    expect(picker.isOpen()).toBe(false);
    await press(input(), 'ArrowDown');
    expect(picker.isOpen()).toBe(true);
    expect((await press(input(), 'ArrowDown')).defaultPrevented).toBe(true);
    expect((await press(input(), 'ArrowDown', { altKey: true })).defaultPrevented).toBe(true);
    expect((await press(input(), 'a')).defaultPrevented).toBe(false);
    expect((await press(input(), 'Escape')).defaultPrevented).toBe(true);
    expect(picker.isOpen()).toBe(false);
    await press(input(), 'ArrowDown');
    await type('16.10.2026');
    await press(input(), 'Enter');
    expect(picker.isOpen()).toBe(false);
    expect(input().value).toBe('16.10.2026');
    await press(input(), 'ArrowDown');
    await press(input(), 'Tab');
    expect(picker.isOpen()).toBe(false);
  });

  it('closes on focus and clicks outside but not inside', async () => {
    await setup({}, new Date(2026, 9, 15));
    await open();
    const focusOut = async (target: EventTarget | null) => {
      panel().dispatchEvent(new FocusEvent('focusout', { relatedTarget: target, bubbles: true }));
      await settle();
    };
    await focusOut(null);
    await focusOut(cell('2026-10-16'));
    await focusOut(input());
    expect(picker.isOpen()).toBe(true);
    input().dispatchEvent(new FocusEvent('blur', { relatedTarget: cell('2026-10-16') }));
    await settle();
    expect(picker.isOpen()).toBe(true);
    picker.onOutsideClick({ target: input() } as unknown as MouseEvent);
    expect(picker.isOpen()).toBe(true);
    picker.onOutsideClick({ target: document.body } as unknown as MouseEvent);
    expect(picker.isOpen()).toBe(false);
    await settle();
    await open();
    await focusOut(document.body);
    expect(picker.isOpen()).toBe(false);
    await open();
    input().dispatchEvent(new FocusEvent('blur', { relatedTarget: document.body }));
    await settle();
    expect(picker.isOpen()).toBe(false);
    await open();
    expect((await press(panel(), 'Escape')).defaultPrevented).toBe(true);
    expect(picker.isOpen()).toBe(false);
    expect(document.activeElement).toBe(input());
  });

  it('ignores Escape in an inline panel', async () => {
    await setup({ inline: true });
    expect((await press(panel(), 'Escape')).defaultPrevented).toBe(false);
    picker.open();
    expect(picker.isOpen()).toBe(false);
  });

  it('opens from the button, the click and not when it cannot', async () => {
    await setup({ showIcon: true, showOnFocus: false }, new Date(2026, 9, 15));
    await open();
    expect(picker.isOpen()).toBe(false);
    input().click();
    await settle();
    expect(picker.isOpen()).toBe(false);
    const button = $('.tx-datepicker__dropdown');
    button.click();
    await settle();
    expect(picker.isOpen()).toBe(true);
    button.click();
    await settle();
    expect(picker.isOpen()).toBe(false);
    fixture.componentRef.setInput('showOnFocus', true);
    input().click();
    await settle();
    expect(picker.isOpen()).toBe(true);
    picker.close();
    fixture.componentRef.setInput('readonly', true);
    await settle();
    input().click();
    expect(picker.isOpen()).toBe(false);
  });

  it('commits a typed draft when the panel closes', async () => {
    await setup({}, new Date(2026, 9, 15));
    await open();
    await type('8.10.2026');
    expect(input().value).toBe('8.10.2026');
    picker.close();
    await settle();
    expect(input().value).toBe('08.10.2026');
    expect(picker.showPanel()).toBe(false);
  });

  it('opens before the first render with no field width', () => {
    fixture = TestBed.createComponent(TxDatePicker);
    fixture.componentInstance.open();
    expect(fixture.componentInstance.isOpen()).toBe(true);
    expect(fixture.componentInstance.panelMinWidth()).toBe(0);
  });

  it('keeps the panel when it opens again before it is gone', async () => {
    await setup({}, new Date(2026, 9, 15));
    picker.open();
    picker.close(false);
    await settle();
    expect(picker.isPanelMounted()).toBe(false);
    picker.open();
    await settle();
    picker.close(false);
    picker.open();
    await settle();
    expect(picker.isPanelMounted()).toBe(true);
    expect(panel()).not.toBeNull();
  });

  it('follows the overlay placement', async () => {
    await setup({}, new Date(2026, 9, 15));
    await open();
    const pair = { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' } as const;
    picker.onPositionChange({ connectionPair: { ...pair, panelClass: 'tx-placement-top-start' } } as ConnectedOverlayPositionChange);
    expect(picker.placement()).toBe('top-start');
    picker.onPositionChange({ connectionPair: pair } as ConnectedOverlayPositionChange);
    expect(picker.placement()).toBe('bottom-start');
  });

  it('shows as many months as the matching breakpoint allows', async () => {
    const queries: FakeQuery[] = [];
    const responsiveOptions = [
      { breakpoint: '600px', numberOfMonths: 1 },
      { breakpoint: '1024px', numberOfMonths: 2 },
    ];
    await setup({ inline: true, numberOfMonths: 3, responsiveOptions });
    expect($$('.tx-datepicker__calendar')).toHaveLength(3);
    fixture.destroy();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (media: string) => {
        const query = new FakeQuery(media, media.includes('1024px'));
        queries.push(query);
        return query;
      },
    });
    try {
      await setup({ inline: true, numberOfMonths: 3, responsiveOptions });
      expect($$('.tx-datepicker__calendar')).toHaveLength(2);
      queries.forEach((query) => (query.matches = true));
      queries[0].dispatchEvent(new Event('change'));
      await settle();
      expect($$('.tx-datepicker__calendar')).toHaveLength(1);
      queries.forEach((query) => (query.matches = false));
      queries[0].dispatchEvent(new Event('change'));
      await settle();
      expect($$('.tx-datepicker__calendar')).toHaveLength(3);
      fixture.destroy();
      expect(queries.map((query) => query.removed)).toEqual([1, 1]);
    } finally {
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });

  it('opens a centered touch panel with a mask', async () => {
    await setup({ touchUI: true }, new Date(2026, 9, 15));
    expect(input().getAttribute('inputmode')).toBe('none');
    await open();
    expect(panel().classList).toContain('tx-datepicker__panel--touch');
    expect($('.tx-datepicker-mask').getAttribute('style')).toContain('var(--tx-date-picker-touch-mask-background)');
    await press(input(), 'Tab');
    input().dispatchEvent(new FocusEvent('blur', { relatedTarget: document.body }));
    panel().dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body, bubbles: true }));
    await press(document.body, 'a');
    expect(picker.isOpen()).toBe(true);
    await press(document.body, 'Escape');
    expect(picker.isOpen()).toBe(false);
    await settle();
    expect(picker.isPanelMounted()).toBe(false);
    await open();
    $$('.tx-datepicker-mask').at(-1)?.click();
    await settle();
    expect(picker.isOpen()).toBe(false);
    await open();
    expect(panel()).not.toBeNull();
    fixture.destroy();
    expect(panel()).toBeNull();
  });

  it('starts from the default date and the locale format and week start', async () => {
    TestBed.inject(TxLocaleService).locale.update((locale) => ({ ...locale, dateFormat: undefined }));
    await setup({ inline: true, dateFormat: undefined, defaultDate: new Date(2026, 4, 20) });
    expect(text('.tx-datepicker__select-month')).toEqual(['May']);
    expect(text('.tx-datepicker__weekday')[0]).toBe('Su');
    picker.writeValue(new Date(2026, 6, 4));
    await settle();
    expect(text('.tx-datepicker__select-month')).toEqual(['July']);
    picker.writeValue(null);
    await settle();
    expect(text('.tx-datepicker__select-month')).toEqual(['May']);
    fixture.destroy();
    await setup({ dateFormat: undefined }, new Date(2026, 9, 15));
    expect(input().value).toBe('10/15/2026');
  });

  it('keeps other months and disabled pickers from selecting', async () => {
    await setup({ inline: true, selectOtherMonths: false, hideOnDateTimeSelect: false }, new Date(2026, 9, 15));
    expect(cell('2026-09-27').getAttribute('aria-disabled')).toBe('true');
    cell('2026-09-27').click();
    expect(changes).toEqual([]);
    fixture.componentRef.setInput('showOtherMonths', false);
    await settle();
    expect(cell('2026-09-27')).toBeNull();
    expect($$('.tx-datepicker__day-cell--empty')).toHaveLength(4);
    picker.setDisabledState(true);
    await settle();
    cell('2026-10-16').click();
    expect(changes).toEqual([]);
  });

  it('stays open after a pick when asked to', async () => {
    await setup({ hideOnDateTimeSelect: false }, new Date(2026, 9, 15));
    await open();
    cell('2026-10-16').click();
    await settle();
    expect(last()).toEqual(new Date(2026, 9, 16));
    expect(picker.isOpen()).toBe(true);
  });

  it('moves by weeks, months and years in the grid', async () => {
    await setup({ inline: true }, new Date(2026, 9, 15));
    await press(active(), 'ArrowUp');
    expect(active().getAttribute('data-date')).toBe('2026-10-08');
    await press(active(), 'PageUp');
    expect(active().getAttribute('data-date')).toBe('2026-09-08');
    await press(active(), 'PageDown', { shiftKey: true });
    expect(active().getAttribute('data-date')).toBe('2027-09-08');
  });

  it('previews ranges only up to selectable days', async () => {
    await setup({ inline: true, selectionMode: 'range', maxDate: new Date(2026, 9, 20) }, [new Date(2026, 9, 18), null]);
    cell('2026-10-25').dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect($$('.tx-datepicker__day--preview')).toHaveLength(0);
    await press(active(), 'ArrowRight');
    await press(active(), 'ArrowRight');
    await press(active(), 'ArrowRight');
    expect(active().getAttribute('data-date')).toBe('2026-10-21');
    expect($$('.tx-datepicker__day--preview')).toHaveLength(0);
    await press(active(), 'ArrowLeft');
    expect($$('.tx-datepicker__day--preview')).toHaveLength(2);
  });

  it('keeps an invalid draft on request and clears an empty one', async () => {
    await setup({ keepInvalid: true }, new Date(2026, 9, 15));
    await type('nope');
    input().dispatchEvent(new FocusEvent('blur'));
    await settle();
    expect(input().value).toBe('nope');
    expect(changes).toEqual([]);
    await type('   ');
    expect(last()).toBeNull();
    await press(input(), 'Enter');
    expect(input().value).toBe('');
  });

  it('closes when a scroll container of the field scrolls', async () => {
    const host = TestBed.createComponent(ScrollHost);
    host.autoDetectChanges();
    await host.whenStable();
    const scrollPicker = host.debugElement.children[0].children[0].componentInstance as TxDatePicker;
    host.nativeElement.querySelector('input').dispatchEvent(new FocusEvent('focus'));
    await host.whenStable();
    expect(scrollPicker.isOpen()).toBe(true);
    document.dispatchEvent(new Event('scroll'));
    expect(scrollPicker.isOpen()).toBe(true);
    host.nativeElement.querySelector('.scroller').dispatchEvent(new Event('scroll'));
    expect(scrollPicker.isOpen()).toBe(false);
  });
});

describe('TxDatePicker templates', () => {
  let fixture: ComponentFixture<TemplatesHost>;
  const $ = (selector: string) => document.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 15, 10, 0));
    fixture = TestBed.createComponent(TemplatesHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('renders own icons, header, footer, decade and buttons', async () => {
    expect($('.tx-datepicker__dropdown .own-trigger')).not.toBeNull();
    fixture.componentInstance.iconDisplay.set('input');
    await fixture.whenStable();
    expect($('.tx-datepicker__dropdown')).toBeNull();
    $('.own-input-icon').click();
    await fixture.whenStable();
    expect($('.tx-datepicker__panel .own-header')?.textContent).toBe('Header');
    expect($('.tx-datepicker__panel .own-footer')?.textContent).toBe('Footer');
    $('.own-today').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toEqual(new Date(2026, 9, 15));
    $('.tx-datepicker__input-icon').click();
    await fixture.whenStable();
    $('.own-clear').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBeNull();
    expect($('.tx-datepicker__panel')).toBeNull();
    fixture.componentInstance.inline.set(true);
    await fixture.whenStable();
    $('.tx-datepicker__select-year').click();
    await fixture.whenStable();
    expect($('.tx-datepicker__decade')?.textContent?.trim()).toBe('2020s');
  });
});
