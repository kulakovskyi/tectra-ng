import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxDatePicker } from './datepicker.component';
import { TxDatePickerDate } from './datepicker.templates';
import { TxDatePickerDataType, TxDatePickerSelectionMode, TxDatePickerValue, TxDatePickerView } from './datepicker.types';

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
