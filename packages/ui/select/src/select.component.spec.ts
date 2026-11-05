import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxSelectEmptyFilterTemplate, TxSelectFooterTemplate, TxSelectGroupTemplate, TxSelectValueTemplate } from './select-option-template.directive';
import { buildOptionRows, readOptionField } from './select-options';
import { TxSelect } from './select.component';
import { TxSelectChangeEvent, TxSelectLazyLoadEvent } from './select.types';

@Component({
  imports: [TxSelect, ReactiveFormsModule],
  template: `<tx-select [options]="options" [formControl]="control" [placeholder]="'City'" [filter]="filter()" [optionValue]="optionValue()" [variant]="'filled'" [readonly]="readonly()" (closed)="closed = closed + 1" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  options = [
    { label: 'Kyiv', value: 'kyiv' },
    { label: 'Lviv', value: 'lviv' },
    { label: 'Odesa', value: 'odesa' },
  ];
  control = new FormControl<unknown>(null);
  readonly filter = signal(false);
  readonly optionValue = signal('value');
  readonly readonly = signal(false);
  closed = 0;
}

describe('TxSelect', () => {
  let fixture: ComponentFixture<Host>;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const options = () => Array.from(document.querySelectorAll('.tx-select__option')) as HTMLElement[];
  const key = (target: HTMLElement, name: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('shows the placeholder and opens the list', () => {
    expect(trigger().textContent).toContain('City');
    trigger().click();
    fixture.detectChanges();
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Kyiv', 'Lviv', 'Odesa']);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('selects with a click and closes, marking the control touched', () => {
    trigger().click();
    fixture.detectChanges();
    options()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('lviv');
    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(fixture.componentInstance.closed).toBe(1);
    expect(trigger().textContent).toContain('Lviv');
  });

  it('works from the keyboard', () => {
    key(trigger(), 'ArrowDown');
    key(trigger(), 'ArrowDown');
    key(trigger(), 'Enter');
    expect(fixture.componentInstance.control.value).toBe('lviv');
  });

  it('jumps with Home / End and finds by typed letters', () => {
    key(trigger(), 'ArrowDown');
    key(trigger(), 'End');
    key(trigger(), 'Enter');
    expect(fixture.componentInstance.control.value).toBe('odesa');
    key(trigger(), 'k');
    expect(fixture.componentInstance.control.value).toBe('kyiv');
  });

  it('filters the options', () => {
    fixture.componentInstance.filter.set(true);
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    search.value = 'od';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Odesa']);
  });

  it('writes the whole option with an empty optionValue', () => {
    fixture.componentInstance.optionValue.set('');
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();
    options()[0].click();
    expect(fixture.componentInstance.control.value).toEqual({ label: 'Kyiv', value: 'kyiv' });
  });

  it('does not open when readonly and shows the variant', () => {
    fixture.componentRef.instance.readonly.set(true);
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();
    expect(options()).toHaveLength(0);
    expect(trigger().getAttribute('aria-readonly')).toBe('true');
    expect((fixture.nativeElement.querySelector('tx-select') as HTMLElement).getAttribute('data-variant')).toBe('filled');
  });

  it('turns invalid when a required control is touched without a value', async () => {
    fixture.componentInstance.control.setValidators(Validators.required);
    fixture.componentInstance.control.updateValueAndValidity();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    trigger().click();
    fixture.detectChanges();
    key(trigger(), 'Escape');
    await fixture.whenStable();
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
  });

  it('follows the disabled state of the form control', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(trigger().disabled).toBe(true);
  });

  it('closes when the trigger scrolls out of the window', () => {
    trigger().click();
    fixture.detectChanges();
    trigger().getBoundingClientRect = () => ({ top: -60, bottom: -28, left: 0, right: 100, width: 100, height: 32, x: 0, y: -60, toJSON: () => ({}) });
    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.closed).toBe(1);
  });
});

@Component({
  imports: [TxSelect, ReactiveFormsModule, TxSelectGroupTemplate, TxSelectValueTemplate, TxSelectFooterTemplate, TxSelectEmptyFilterTemplate],
  template: `
    <tx-select
      [options]="options()"
      [formControl]="control"
      [group]="group()"
      [filter]="true"
      [filterBy]="'label,code'"
      [filterDelay]="filterDelay()"
      [showClear]="true"
      [editable]="editable()"
      [loading]="loading()"
      [checkmark]="checkmark()"
      [lazy]="lazy()"
      [virtualScroll]="virtual()"
      [dataKey]="dataKey()"
      [optionValue]="optionValue()"
      [dt]="{ option: { padding: '2px' } }"
      [pt]="{ root: { class: 'own-root' }, panel: { class: 'own-panel' }, option: { style: { color: 'red' } } }"
      [unstyled]="unstyled()"
      [placeholder]="'City'"
      (changed)="changes.push($event)"
      (cleared)="clears = clears + 1"
      (filtered)="queries.push($event.query)"
      (lazyLoad)="loads.push($event)"
    >
      <ng-template txSelectGroup let-group>Region {{ group.label }}</ng-template>
      <ng-template txSelectValue let-option>Picked {{ option.label }}</ng-template>
      <ng-template txSelectFooter><button type="button" class="own-footer">Add</button></ng-template>
      <ng-template txSelectEmptyFilter let-query><span class="own-create">Create {{ query }}</span></ng-template>
    </tx-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FeatureHost {
  readonly flat: object[] = [
    { label: 'Kyiv', value: 'kyiv', code: 'KBP' },
    { label: 'Lviv', value: 'lviv', code: 'LWO', disabled: true },
    { label: 'Odesa', value: 'odesa', code: 'ODS' },
    { label: 'Łódź', value: 'lodz', code: 'LCJ' },
  ];
  readonly grouped: object[] = [
    { label: 'West', items: [{ label: 'Lviv', value: 'lviv' }, { label: 'Uzhhorod', value: 'uzh' }] },
    { label: 'South', items: [{ label: 'Odesa', value: 'odesa' }] },
  ];
  readonly options = signal<readonly unknown[]>(this.flat);
  readonly group = signal(false);
  readonly editable = signal(false);
  readonly loading = signal(false);
  readonly checkmark = signal(true);
  readonly lazy = signal(false);
  readonly virtual = signal(false);
  readonly unstyled = signal<boolean | undefined>(undefined);
  readonly dataKey = signal<string | undefined>(undefined);
  readonly optionValue = signal('value');
  readonly filterDelay = signal(0);
  control = new FormControl<unknown>(null);
  changes: TxSelectChangeEvent[] = [];
  clears = 0;
  queries: string[] = [];
  loads: TxSelectLazyLoadEvent[] = [];
}

describe('TxSelect features', () => {
  beforeAll(() => {
    Element.prototype.scrollTo ??= function scrollTo(this: Element) {
      return undefined;
    };
  });

  let fixture: ComponentFixture<FeatureHost>;
  let host: FeatureHost;
  const root = () => fixture.nativeElement.querySelector('tx-select') as HTMLElement;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLElement;
  const box = () => fixture.nativeElement.querySelector('.tx-select__box') as HTMLElement;
  const options = () => Array.from(document.querySelectorAll('.tx-select__option[role="option"]')) as HTMLElement[];
  const labels = () => options().map((option) => option.textContent?.trim());
  const search = () => document.querySelector('.tx-select__filter-input') as HTMLInputElement;
  const render = () => fixture.detectChanges();
  const key = (target: HTMLElement, name: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    render();
  };
  const type = (input: HTMLInputElement, text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    render();
  };
  const open = () => {
    box().click();
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureHost);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('skips disabled options with keys and clicks', () => {
    open();
    expect(options()[1].getAttribute('aria-disabled')).toBe('true');
    expect(document.querySelector('.tx-select__option--active')).toBeNull();
    key(trigger(), 'ArrowDown');
    key(trigger(), 'ArrowDown');
    key(trigger(), 'Enter');
    expect(host.control.value).toBe('odesa');
    open();
    options()[1].click();
    render();
    expect(host.control.value).toBe('odesa');
    expect(host.changes.map((change) => change.value)).toEqual(['odesa']);
  });

  it('filters by several fields, ignoring case and accents, and reports the query', () => {
    open();
    type(search(), 'lodz');
    expect(labels()).toEqual(['Łódź']);
    type(search(), 'ods');
    expect(labels()).toEqual(['Odesa']);
    expect(host.queries).toEqual(['lodz', 'ods']);
  });

  it('delays the filter output', async () => {
    vi.useFakeTimers();
    host.filterDelay.set(300);
    render();
    open();
    type(search(), 'k');
    type(search(), 'ky');
    expect(host.queries).toEqual([]);
    vi.advanceTimersByTime(300);
    expect(host.queries).toEqual(['ky']);
    vi.useRealTimers();
  });

  it('shows the empty filter template with the query', () => {
    open();
    type(search(), 'Rivne');
    expect(document.querySelector('.own-create')?.textContent).toBe('Create Rivne');
  });

  it('renders groups with their template as named groups', () => {
    host.options.set(host.grouped);
    host.group.set(true);
    render();
    open();
    const groups = Array.from(document.querySelectorAll('[role="group"]'));
    expect(groups).toHaveLength(2);
    const header = document.getElementById(groups[0].getAttribute('aria-labelledby') ?? '');
    expect(header?.textContent?.trim()).toBe('Region West');
    expect(labels()).toEqual(['Lviv', 'Uzhhorod', 'Odesa']);
    key(trigger(), 'End');
    key(trigger(), 'Enter');
    expect(host.control.value).toBe('odesa');
  });

  it('clears the value', () => {
    host.control.setValue('kyiv');
    render();
    expect(trigger().textContent).toContain('Picked Kyiv');
    const clear = fixture.nativeElement.querySelector('.tx-select__clear') as HTMLButtonElement;
    expect(clear.getAttribute('aria-label')).toBe('Clear');
    clear.click();
    render();
    expect(host.control.value).toBeNull();
    expect(host.clears).toBe(1);
    expect(fixture.nativeElement.querySelector('.tx-select__clear')).toBeNull();
    expect(document.querySelector('.tx-select__panel')).toBeNull();
  });

  it('takes free text or a matching option when editable', () => {
    host.editable.set(true);
    render();
    const input = trigger() as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    type(input, 'Kharkiv');
    expect(host.control.value).toBe('Kharkiv');
    type(input, 'odesa');
    expect(host.control.value).toBe('odesa');
    key(input, 'Escape');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows a spinner and a loading message', () => {
    host.loading.set(true);
    host.options.set([]);
    render();
    expect(fixture.nativeElement.querySelector('.tx-select__spinner')).not.toBeNull();
    expect(trigger().getAttribute('aria-busy')).toBe('true');
    open();
    expect(document.querySelector('.tx-select__empty')?.textContent?.trim()).toBe('Loading');
  });

  it('hides the checkmark on demand', () => {
    host.control.setValue('kyiv');
    render();
    open();
    expect(document.querySelector('.tx-select__check')).not.toBeNull();
    key(trigger(), 'Escape');
    host.checkmark.set(false);
    render();
    open();
    expect(document.querySelector('.tx-select__check')).toBeNull();
  });

  it('compares object values by dataKey', () => {
    host.optionValue.set('');
    host.dataKey.set('value');
    host.control.setValue({ label: 'Odesa', value: 'odesa' });
    render();
    expect(trigger().textContent).toContain('Picked Odesa');
  });

  it('asks for missing options and keeps the chosen one when the page changes', () => {
    host.lazy.set(true);
    host.options.set([{ label: 'Kyiv', value: 'kyiv' }, undefined, undefined]);
    render();
    open();
    expect(document.querySelectorAll('.tx-select__option--loader')).toHaveLength(2);
    expect(host.loads).toEqual([{ first: 1, last: 3, query: '' }]);
    options()[0].click();
    render();
    host.options.set([undefined, { label: 'Lviv', value: 'lviv' }]);
    render();
    expect(trigger().textContent).toContain('Picked Kyiv');
  });

  it('lazy filtering is left to the server', () => {
    host.lazy.set(true);
    render();
    open();
    type(search(), 'zzz');
    expect(labels()).toHaveLength(4);
    expect(host.queries).toEqual(['zzz']);
  });

  it('renders a virtual list', async () => {
    host.virtual.set(true);
    host.options.set(Array.from({ length: 500 }, (_, index) => ({ label: `Item ${index}`, value: index })));
    render();
    open();
    await fixture.whenStable();
    render();
    const list = document.querySelector('cdk-virtual-scroll-viewport');
    expect(list?.getAttribute('role')).toBe('listbox');
    expect((list as HTMLElement).style.height).toBe('200px');
    expect(options().length).toBeLessThan(500);
  });

  it('applies dt, pt and the footer slot; unstyled drops data-styled', () => {
    open();
    const panel = document.querySelector('.tx-select__panel') as HTMLElement;
    expect(root().classList).toContain('own-root');
    expect(root().style.getPropertyValue('--tx-select-option-padding')).toBe('2px');
    expect(panel.classList).toContain('own-panel');
    expect(panel.style.getPropertyValue('--tx-select-option-padding')).toBe('2px');
    expect(options()[0].style.color).toBe('red');
    expect(document.querySelector('.own-footer')).not.toBeNull();
    expect(root().hasAttribute('data-styled')).toBe(true);
    host.unstyled.set(true);
    render();
    expect(root().hasAttribute('data-styled')).toBe(false);
    expect(panel.hasAttribute('data-styled')).toBe(false);
  });
});

describe('select options', () => {
  it('reads nested fields and plain values', () => {
    expect(readOptionField({ user: { name: 'Olena' } }, 'user.name')).toBe('Olena');
    expect(readOptionField('Kyiv', 'label')).toBe('Kyiv');
    expect(readOptionField({ a: 1 }, '')).toEqual({ a: 1 });
  });

  it('builds rows from plain strings', () => {
    const rows = buildOptionRows({
      options: ['Kyiv', 'Lviv'],
      fields: { label: 'label', value: 'value', disabled: 'disabled', groupLabel: 'label', groupChildren: 'items', dataKey: undefined },
      group: false,
      idPrefix: 'x',
      query: 'lv',
      filterFields: [],
      matchMode: 'startsWith',
      isSelected: (value) => value === 'Lviv',
    });
    expect(rows).toEqual([{ type: 'option', id: 'x-1', index: 1, label: 'Lviv', value: 'Lviv', option: 'Lviv', selected: true, disabled: false }]);
  });
});
