import { CdkConnectedOverlay, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TxOptionList } from './option-list.component';
import { TxOptionsBase } from './options-base';
import { TxSelectBase } from './select-base';
import {
  TxSelectEmptyFilterTemplate,
  TxSelectEmptyTemplate,
  TxSelectFooterTemplate,
  TxSelectGroupTemplate,
  TxSelectHeaderTemplate,
  TxSelectOptionTemplate,
  TxSelectValueTemplate,
} from './select-option-template.directive';
import { buildOptionRows, foldText, matchesQuery, readOptionField, sameOptionValue } from './select-options';
import { TxSelect } from './select.component';
import { TxSelectChangeEvent, TxSelectItem, TxSelectLazyLoadEvent, TxSelectRow } from './select.types';

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

  it('stays open while the trigger is scrolled out of the window', () => {
    trigger().click();
    fixture.detectChanges();
    const box = trigger().closest('.tx-select__box') as HTMLElement;
    box.getBoundingClientRect = () => ({ top: -60, bottom: -28, left: 0, right: 100, width: 100, height: 32, x: 0, y: -60, toJSON: () => ({}) });
    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(fixture.componentInstance.closed).toBe(0);
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

  it('drops a delayed filter output when destroyed', () => {
    vi.useFakeTimers();
    try {
      host.filterDelay.set(300);
      render();
      open();
      type(search(), 'k');
      fixture.destroy();
      vi.advanceTimersByTime(300);
      expect(host.queries).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
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

  const fields = { label: 'label', value: 'value', disabled: 'disabled', groupLabel: 'name', groupChildren: 'items', dataKey: undefined };
  const request = { fields, idPrefix: 'x', filterFields: [], matchMode: 'contains' as const, isSelected: () => false };

  it('stops reading a nested field at a plain value', () => {
    expect(readOptionField({ user: 'Olena' }, 'user.name')).toBeUndefined();
    expect(readOptionField(null, 'label')).toBeNull();
  });

  it('matches by every mode on folded text', () => {
    expect(foldText('Straße Øresund')).toBe('strasse oresund');
    expect(matchesQuery('Kyiv', 'iv', 'endsWith')).toBe(true);
    expect(matchesQuery('Kyiv', 'ky', 'endsWith')).toBe(false);
    expect(matchesQuery('Kyiv', 'kyiv', 'equals')).toBe(true);
    expect(matchesQuery('Kyiv', 'ky', 'equals')).toBe(false);
  });

  it('compares by dataKey only for two objects', () => {
    expect(sameOptionValue({ id: 1, name: 'a' }, { id: 1, name: 'b' }, 'id')).toBe(true);
    expect(sameOptionValue({ id: 1 }, null, 'id')).toBe(false);
    expect(sameOptionValue('a', 'a', 'id')).toBe(true);
  });

  it('keeps indexes stable and labels empty when a field is missing', () => {
    const rows = buildOptionRows({ ...request, options: [{ value: 1 }, { label: 'Lviv', value: 2 }], group: false, query: '' });
    expect(rows.map((row) => (row.type === 'option' ? row.label : row.type))).toEqual(['', 'Lviv']);
    const filtered = buildOptionRows({ ...request, options: [{ value: 1 }, null, { label: 'Lviv', value: 2 }], group: false, query: 'lv' });
    expect(filtered).toEqual([expect.objectContaining({ id: 'x-2', index: 2, label: 'Lviv' })]);
  });

  it('drops groups without matches and tolerates groups without children', () => {
    const options = [{ name: 'West', items: [{ label: 'Lviv' }, { label: 'Uzhhorod' }] }, { items: 'none' }, { name: 'South', items: [{ label: 'Odesa' }] }];
    const all = buildOptionRows({ ...request, options, group: true, query: '' });
    expect(all.map((row) => row.type + ':' + (row.type === 'loader' ? '' : row.label))).toEqual(['group:West', 'option:Lviv', 'option:Uzhhorod', 'group:', 'group:South', 'option:Odesa']);
    const filtered = buildOptionRows({ ...request, options, group: true, query: 'uzh' });
    expect(filtered).toEqual([expect.objectContaining({ type: 'group', label: 'West' }), expect.objectContaining({ type: 'option', id: 'x-1', label: 'Uzhhorod' })]);
  });
});

const NATO = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November'];
const BLOCKED = new Set(['Bravo', 'Kilo', 'November']);

@Component({
  imports: [TxSelect, ReactiveFormsModule, TxSelectOptionTemplate, TxSelectHeaderTemplate, TxSelectEmptyTemplate, TxSelectFooterTemplate],
  template: `
    <div class="scroller" style="overflow: auto">
      <tx-select
        [options]="options()"
        [formControl]="control"
        [filter]="filter()"
        [resetFilterOnHide]="true"
        [showClear]="true"
        [editable]="editable()"
        [readonly]="readonly()"
        [lazy]="lazy()"
        [placeholder]="'Letter'"
        (opened)="opens = opens + 1"
        (closed)="closes = closes + 1"
        (filtered)="queries.push($event.query)"
        (lazyLoad)="loads.push($event)"
      >
        <ng-template txSelectHeader><button type="button" class="own-header">Top</button></ng-template>
        <ng-template txSelectOption let-option let-selected="selected">{{ option.label }}{{ selected ? ' *' : '' }}</ng-template>
        <ng-template txSelectEmpty><span class="own-empty">Nothing here</span></ng-template>
        @if (footer()) {
          <ng-template txSelectFooter><button type="button" class="own-footer">Add</button></ng-template>
        }
      </tx-select>
    </div>
    <button type="button" class="outside">Outside</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BehaviourHost {
  readonly letters = NATO.map((label) => ({ label, value: label.toLowerCase(), disabled: BLOCKED.has(label) }));
  readonly options = signal<readonly unknown[]>(this.letters);
  readonly filter = signal(false);
  readonly editable = signal(false);
  readonly readonly = signal(false);
  readonly lazy = signal(false);
  readonly footer = signal(true);
  control = new FormControl<unknown>(null);
  opens = 0;
  closes = 0;
  queries: string[] = [];
  loads: TxSelectLazyLoadEvent[] = [];
}

describe('TxSelect behaviour', () => {
  let fixture: ComponentFixture<BehaviourHost>;
  let host: BehaviourHost;
  const select = () => fixture.debugElement.query(By.directive(TxSelect)).componentInstance as TxSelect;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLElement;
  const box = () => fixture.nativeElement.querySelector('.tx-select__box') as HTMLElement;
  const panel = () => document.querySelector('.tx-select__panel') as HTMLElement | null;
  const search = () => document.querySelector('.tx-select__filter-input') as HTMLInputElement;
  const active = () => document.querySelector('.tx-select__option--active')?.textContent?.trim() ?? null;
  const render = () => fixture.detectChanges();
  const key = (target: HTMLElement, name: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    render();
    return event;
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
  const isOpen = () => trigger().getAttribute('aria-expanded') === 'true';

  beforeEach(() => {
    fixture = TestBed.createComponent(BehaviourHost);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('pages past disabled options in both directions', () => {
    key(trigger(), 'ArrowDown');
    expect(active()).toBe('Alpha');
    key(trigger(), 'PageDown');
    expect(active()).toBe('Lima');
    key(trigger(), 'PageUp');
    expect(active()).toBe('Alpha');
    key(trigger(), 'End');
    expect(active()).toBe('Mike');
    key(trigger(), 'PageDown');
    expect(active()).toBe('Mike');
  });

  it('starts from the last option with ArrowUp and from the selected one when there is a value', () => {
    open();
    expect(active()).toBeNull();
    key(trigger(), 'ArrowUp');
    expect(active()).toBe('Mike');
    key(trigger(), 'Escape');
    host.control.setValue('echo');
    render();
    expect(trigger().textContent).toContain('Echo *');
    open();
    key(trigger(), 'ArrowDown');
    expect(active()).toBe('Echo *');
    key(trigger(), 'Escape');
    key(trigger(), 'ArrowDown');
    expect(active()).toBe('Echo *');
  });

  it('does nothing when paging an empty list and shows the empty template', () => {
    host.options.set([]);
    render();
    open();
    expect(document.querySelector('.own-empty')?.textContent).toBe('Nothing here');
    key(trigger(), 'PageDown');
    key(trigger(), 'ArrowUp');
    expect(active()).toBeNull();
    expect(select().activeIndex()).toBe(-1);
    expect(isOpen()).toBe(true);
  });

  it('opens with Space, closes with Enter when nothing is active and with Tab', () => {
    const space = key(trigger(), ' ');
    expect(space.defaultPrevented).toBe(true);
    expect(isOpen()).toBe(true);
    expect(host.opens).toBe(1);
    select().activeIndex.set(-1);
    key(trigger(), 'Enter');
    expect(isOpen()).toBe(false);
    expect(host.closes).toBe(1);
    key(trigger(), 'Escape');
    expect(host.closes).toBe(1);
    open();
    key(trigger(), 'Tab');
    expect(isOpen()).toBe(false);
  });

  it('finds options by typed letters while open and ignores misses and shortcuts', () => {
    open();
    key(trigger(), 'g');
    expect(active()).toBe('Golf');
    expect(isOpen()).toBe(true);
    key(trigger(), 'z');
    expect(active()).toBe('Golf');
    key(trigger(), 'a', { ctrlKey: true });
    expect(active()).toBe('Golf');
    key(trigger(), 'Escape');
    key(trigger(), 'x');
    expect(host.control.value).toBeNull();
  });

  it('keeps Home, End and letters for the search field and resets the query on close', () => {
    host.filter.set(true);
    render();
    open();
    key(search(), 'ArrowDown');
    const home = key(search(), 'Home');
    expect(home.defaultPrevented).toBe(false);
    key(search(), 'e');
    expect(active()).toBe('Alpha');
    type(search(), 'zzz');
    expect(host.queries).toEqual(['zzz']);
    key(search(), 'Enter');
    expect(isOpen()).toBe(false);
    expect(host.queries).toEqual(['zzz', '']);
    expect(select().query()).toBe('');
  });

  it('keeps the panel open on Tab when the panel has more to focus', () => {
    host.filter.set(true);
    render();
    open();
    key(search(), 'Tab');
    expect(isOpen()).toBe(true);
    key(search(), 'Tab', { shiftKey: true });
    expect(isOpen()).toBe(true);
    host.footer.set(false);
    render();
    key(search(), 'Tab');
    expect(isOpen()).toBe(false);
  });

  it('closes on Escape from the panel and keeps the default for focusable targets on mousedown', () => {
    open();
    const footer = document.querySelector('.own-footer') as HTMLButtonElement;
    const other = key(footer, 'x');
    expect(other.defaultPrevented).toBe(false);
    expect(isOpen()).toBe(true);
    const escape = key(footer, 'Escape');
    expect(escape.defaultPrevented).toBe(true);
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger());
    open();
    const plain = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    panel()?.dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(true);
    const onButton = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    document.querySelector('.own-header')?.dispatchEvent(onButton);
    expect(onButton.defaultPrevented).toBe(false);
  });

  it('closes when focus leaves for the page and returns focus when it goes nowhere', async () => {
    host.filter.set(true);
    render();
    open();
    const header = document.querySelector('.own-header') as HTMLButtonElement;
    header.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: trigger() }));
    render();
    expect(isOpen()).toBe(true);
    search().blur();
    expect(document.activeElement).toBe(document.body);
    header.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await Promise.resolve();
    expect(document.activeElement).toBe(search());
    header.focus();
    header.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await Promise.resolve();
    expect(document.activeElement).toBe(header);
    header.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: fixture.nativeElement.querySelector('.outside') }));
    render();
    expect(isOpen()).toBe(false);
  });

  it('focuses the trigger when focus goes nowhere and there is no search field', async () => {
    open();
    trigger().blur();
    expect(document.activeElement).toBe(document.body);
    (document.querySelector('.own-header') as HTMLElement).dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await Promise.resolve();
    expect(document.activeElement).toBe(trigger());
    select().close();
    render();
    trigger().blur();
    select().onPanelFocusOut(new FocusEvent('focusout', { relatedTarget: null }));
    await Promise.resolve();
    expect(document.activeElement).toBe(document.body);
  });

  it('closes on a click outside but not on a click inside its box', () => {
    host.control.setValue('alpha');
    render();
    open();
    (fixture.nativeElement.querySelector('.tx-select__clear') as HTMLElement).click();
    render();
    expect(host.control.value).toBeNull();
    expect(isOpen()).toBe(true);
    const fromBox = new MouseEvent('click');
    Object.defineProperty(fromBox, 'target', { value: trigger() });
    select().onOutsideClick(fromBox);
    render();
    expect(isOpen()).toBe(true);
    const outside = fixture.nativeElement.querySelector('.outside') as HTMLElement;
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    outside.click();
    render();
    expect(isOpen()).toBe(false);
  });

  it('toggles with box clicks and closes when its scroll container scrolls', () => {
    open();
    expect(isOpen()).toBe(true);
    open();
    expect(isOpen()).toBe(false);
    open();
    fixture.nativeElement.querySelector('.scroller').dispatchEvent(new Event('scroll'));
    render();
    expect(isOpen()).toBe(false);
    expect(host.closes).toBe(2);
  });

  it('closes when the overlay detaches', async () => {
    open();
    const overlay = fixture.debugElement.queryAllNodes(By.directive(CdkConnectedOverlay))[0].injector.get(CdkConnectedOverlay);
    overlay.overlayRef.detach();
    render();
    await fixture.whenStable();
    expect(isOpen()).toBe(false);
    expect(panel()).toBeNull();
  });

  it('unmounts at once when closed before the panel rendered', async () => {
    const component = select();
    component.open();
    component.close();
    component.close();
    expect(host.closes).toBe(1);
    await Promise.resolve();
    expect(component.isPanelMounted()).toBe(false);
  });

  it('ignores keys when readonly and does not open when disabled', () => {
    host.readonly.set(true);
    render();
    key(trigger(), 'ArrowDown');
    expect(isOpen()).toBe(false);
    host.readonly.set(false);
    host.control.disable();
    render();
    key(trigger(), 'ArrowDown');
    expect(isOpen()).toBe(false);
    expect(host.opens).toBe(0);
  });

  it('moves the active option to the first one when the options change under it', () => {
    open();
    key(trigger(), 'End');
    expect(active()).toBe('Mike');
    host.options.set(host.letters.slice(0, 3));
    render();
    expect(active()).toBe('Alpha');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(document.querySelector('.tx-select__option--active')?.id);
  });

  it('lists only enabled options as selectable and does not choose a disabled one', () => {
    const component = select();
    expect(component.selectableItems().map((item) => item.label)).toEqual(NATO.filter((label) => !BLOCKED.has(label)));
    const bravo = component.rows()[1];
    component.choose(bravo as TxSelectItem);
    expect(host.control.value).toBeNull();
  });

  it('asks for the same lazy range only once', () => {
    host.lazy.set(true);
    host.options.set([{ label: 'Alpha', value: 'alpha' }, undefined, undefined]);
    render();
    open();
    expect(host.loads).toEqual([{ first: 1, last: 3, query: '' }]);
    select().onRangeChange({ start: 0, end: 3 });
    select().onRangeChange({ start: 0, end: 1 });
    expect(host.loads).toHaveLength(1);
  });

  it('opens on a box click and clears to null when editable', () => {
    host.editable.set(true);
    render();
    (fixture.nativeElement.querySelector('.tx-select__dropdown') as HTMLElement).click();
    render();
    expect(isOpen()).toBe(true);
    const input = trigger() as HTMLInputElement;
    input.click();
    render();
    expect(isOpen()).toBe(true);
    type(input, 'gol');
    expect(active()).toBe('Golf');
    expect(host.control.value).toBe('gol');
    type(input, '');
    expect(host.control.value).toBeNull();
    expect(host.opens).toBe(1);
  });

  it('waits for room before the enter animation and falls back to bottom-start', () => {
    const root = document.documentElement;
    const clientHeight = vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return this === root ? 600 : 0;
    });
    const clientWidth = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
      return this === root ? 800 : 0;
    });
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(100);
    vi.spyOn(box(), 'getBoundingClientRect').mockReturnValue({ top: 500, bottom: 540, left: 10, right: 210, width: 200, height: 40 } as DOMRect);
    try {
      open();
      const component = select();
      const below = { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' } as const;
      component.onPositionChange({ connectionPair: below } as ConnectedOverlayPositionChange);
      expect(component.positions()[0].originY).toBe('top');
      expect(component.panelPlacement()).toBe('bottom-start');
      component.onPositionChange({ connectionPair: component.positions()[0] } as ConnectedOverlayPositionChange);
      expect(component.panelPlacement()).toBe('top-start');
    } finally {
      height.mockRestore();
      clientHeight.mockRestore();
      clientWidth.mockRestore();
    }
  });
});

@Component({
  imports: [TxOptionList],
  template: `<tx-option-list [rows]="rows()" [listboxId]="'own-list'" [activeIndex]="active()" [focusable]="true" [virtualScroll]="virtual()" [itemSize]="36" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListHost {
  readonly rows = signal<readonly TxSelectRow[]>(
    buildOptionRows({
      options: [{ label: 'North', items: ['Kyiv', 'Chernihiv'] }],
      fields: { label: 'label', value: 'value', disabled: 'disabled', groupLabel: 'label', groupChildren: 'items', dataKey: undefined },
      group: true,
      idPrefix: 'row',
      query: '',
      filterFields: [],
      matchMode: 'contains',
      isSelected: () => false,
    }),
  );
  readonly active = signal(-1);
  readonly virtual = signal(false);
}

describe('TxOptionList', () => {
  let fixture: ComponentFixture<ListHost>;
  const list = () => fixture.debugElement.query(By.directive(TxOptionList)).componentInstance as TxOptionList;
  const listbox = () => fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;

  beforeAll(() => {
    Element.prototype.scrollTo ??= function scrollTo(this: Element) {
      return undefined;
    };
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListHost);
    fixture.detectChanges();
  });

  it('points aria-activedescendant at the active option only', () => {
    expect(listbox().getAttribute('tabindex')).toBe('0');
    expect(listbox().hasAttribute('aria-activedescendant')).toBe(false);
    fixture.componentInstance.active.set(0);
    fixture.detectChanges();
    expect(listbox().hasAttribute('aria-activedescendant')).toBe(false);
    fixture.componentInstance.active.set(2);
    fixture.detectChanges();
    expect(listbox().getAttribute('aria-activedescendant')).toBe('row-1');
  });

  it('focuses the plain list and the virtual viewport', async () => {
    list().focus();
    expect(document.activeElement).toBe(listbox());
    fixture.componentInstance.virtual.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    list().focus();
    expect(document.activeElement?.tagName).toBe('CDK-VIRTUAL-SCROLL-VIEWPORT');
  });

  it('scrolls the virtual viewport only when the row is out of view', async () => {
    fixture.componentInstance.virtual.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const viewport = list().viewport() as CdkVirtualScrollViewport;
    const scroll = vi.spyOn(viewport, 'scrollToOffset');
    vi.spyOn(viewport, 'getViewportSize').mockReturnValue(72);
    const offset = vi.spyOn(viewport, 'measureScrollOffset').mockReturnValue(36);
    list().scrollToIndex(1);
    expect(scroll).not.toHaveBeenCalled();
    list().scrollToIndex(0);
    expect(scroll).toHaveBeenLastCalledWith(0);
    offset.mockReturnValue(0);
    list().scrollToIndex(2);
    expect(scroll).toHaveBeenLastCalledWith(36);
  });
});

describe('TxSelect recompiled by TestBed', () => {
  it('still binds to a form control and finds its templates when a test overrides the components', () => {
    TestBed.overrideComponent(TxSelect, { set: { styles: [] } });
    TestBed.overrideComponent(TxOptionList, { set: { styles: [] } });
    TestBed.overrideDirective(TxOptionsBase as unknown as Type<unknown>, { set: {} });
    TestBed.overrideDirective(TxSelectBase as unknown as Type<unknown>, { set: {} });
    const fixture = TestBed.createComponent(BehaviourHost);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue('echo');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLElement;
    expect(trigger.textContent).toContain('Echo *');
    (fixture.nativeElement.querySelector('.tx-select__box') as HTMLElement).click();
    fixture.detectChanges();
    expect(document.querySelector('.own-header')).not.toBeNull();
    expect(document.querySelector('.own-footer')).not.toBeNull();
    (document.querySelectorAll('.tx-select__option')[2] as HTMLElement).click();
    expect(fixture.componentInstance.control.value).toBe('charlie');
    document.querySelector('.cdk-overlay-container')?.replaceChildren();
  });
});
