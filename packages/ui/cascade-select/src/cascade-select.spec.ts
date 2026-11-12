import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TxCascadeSelect } from './cascade-select.component';
import { TxCascadeSelectChangeEvent } from './cascade-select.types';

const PLACES = [
  {
    name: 'Ukraine',
    regions: [
      { name: 'Kyiv region', cities: [{ cname: 'Kyiv', code: 'KBP' }, { cname: 'Bila Tserkva', code: 'BTS' }] },
      { name: 'Lviv region', cities: [{ cname: 'Lviv', code: 'LWO' }, { cname: 'Drohobych', code: 'DRH', off: true }, { cname: 'Stryi', code: 'STR' }] },
    ],
  },
  { name: 'Poland', regions: [{ name: 'Masovia', cities: [{ cname: 'Warsaw', code: 'WAW' }] }] },
];

@Component({
  imports: [TxCascadeSelect, ReactiveFormsModule],
  template: `<tx-cascade-select
    [options]="places"
    [formControl]="control"
    [optionLabel]="'cname'"
    [optionValue]="'code'"
    [optionDisabled]="'off'"
    [optionGroupLabel]="'name'"
    [optionGroupChildren]="['regions', 'cities']"
    [showPath]="showPath()"
    [showClear]="true"
    [placeholder]="'City'"
    (changed)="changes.push($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly places = PLACES;
  control = new FormControl<string | null>(null);
  readonly showPath = signal(false);
  changes: TxCascadeSelectChangeEvent[] = [];
}

describe('TxCascadeSelect', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const columns = () => Array.from(document.querySelectorAll('.tx-cascade-select__column')) as HTMLElement[];
  const items = (column: number) => Array.from(columns()[column]?.querySelectorAll('[role="treeitem"]') ?? []) as HTMLElement[];
  const active = () => document.querySelector('.tx-cascade-select__option--active')?.textContent?.trim();
  const render = () => fixture.detectChanges();
  const key = (name: string) => {
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('walks the levels with the arrows and picks a leaf', () => {
    key('ArrowDown');
    expect(columns()).toHaveLength(2);
    expect(active()).toBe('Ukraine');
    key('ArrowRight');
    expect(active()).toBe('Kyiv region');
    expect(items(0)[0].getAttribute('aria-expanded')).toBe('true');
    key('ArrowDown');
    key('Enter');
    expect(active()).toBe('Lviv');
    expect(items(2)[0].getAttribute('aria-level')).toBe('3');
    key('ArrowDown');
    expect(active()).toBe('Stryi');
    key('ArrowLeft');
    expect(active()).toBe('Lviv region');
    key('ArrowRight');
    key('End');
    key('Enter');
    expect(host.control.value).toBe('STR');
    expect(trigger().textContent?.trim()).toBe('Stryi');
    expect(host.changes[0].path.map((option) => (option as { name?: string; cname?: string }).name ?? (option as { cname: string }).cname)).toEqual(['Ukraine', 'Lviv region', 'Stryi']);
  });

  it('opens at the selected value, shows the path and clears', () => {
    host.control.setValue('WAW');
    host.showPath.set(true);
    render();
    expect(trigger().textContent?.trim()).toBe('Poland / Masovia / Warsaw');
    trigger().click();
    render();
    expect(columns()).toHaveLength(3);
    expect(items(2)[0].getAttribute('aria-selected')).toBe('true');
    (fixture.nativeElement.querySelector('.tx-select__clear') as HTMLButtonElement).click();
    render();
    expect(host.control.value).toBeNull();
  });

  it('opens groups on hover and picks with a click', () => {
    trigger().click();
    render();
    items(0)[1].dispatchEvent(new MouseEvent('mouseenter'));
    render();
    items(1)[0].dispatchEvent(new MouseEvent('mouseenter'));
    render();
    items(2)[0].click();
    render();
    expect(host.control.value).toBe('WAW');
  });
});

const MENU = [
  { label: 'Fruits', items: [{ label: 'Apple', value: 'apple' }, { label: 'Pear', value: 'pear', disabled: true }, { label: 'Plum', value: 'plum' }] },
  { label: 'Locked', items: [{ label: 'Gone', value: 'gone', disabled: true }] },
  { value: 'nameless' },
  { label: 'Water', value: 'water' },
];

@Component({
  imports: [TxCascadeSelect, ReactiveFormsModule],
  template: `<div class="scroller" style="overflow: auto">
    <tx-cascade-select
      [options]="options()"
      [formControl]="control"
      [readonly]="readonly()"
      [emptyMessage]="emptyMessage()"
      [dataKey]="dataKey()"
      [showClear]="true"
      (opened)="events.push('opened')"
      (closed)="events.push('closed')"
    />
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  readonly options = signal<readonly unknown[]>(MENU);
  readonly readonly = signal(false);
  readonly emptyMessage = signal<string | undefined>(undefined);
  readonly dataKey = signal<string | undefined>(undefined);
  control = new FormControl<unknown>(null);
  events: string[] = [];
}

describe('TxCascadeSelect with plain options', () => {
  let fixture: ComponentFixture<PlainHost>;
  let host: PlainHost;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const box = () => fixture.nativeElement.querySelector('.tx-select__box') as HTMLElement;
  const panel = () => document.querySelector('.tx-cascade-select__panel') as HTMLElement | null;
  const columns = () => Array.from(document.querySelectorAll('.tx-cascade-select__column')) as HTMLElement[];
  const items = (column: number) => Array.from(columns()[column]?.querySelectorAll('[role="treeitem"]') ?? []) as HTMLElement[];
  const active = () => document.querySelector('.tx-cascade-select__option--active')?.textContent?.trim();
  const component = () => fixture.debugElement.query(By.directive(TxCascadeSelect)).componentInstance as TxCascadeSelect;
  const render = () => fixture.detectChanges();
  const press = (name: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
    trigger().dispatchEvent(event);
    return event;
  };
  const key = (name: string, init: KeyboardEventInit = {}) => {
    const event = press(name, init);
    render();
    return event;
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(PlainHost);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('opens with keys and the box, emits opened and closed, and closes on Escape, Tab, the box and outside clicks', async () => {
    key('a');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    key(' ');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(items(0)[0].id);
    expect(key('Escape').defaultPrevented).toBe(true);
    expect(trigger().getAttribute('aria-activedescendant')).toBeNull();
    key('ArrowUp');
    key('Tab');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    box().click();
    render();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    box().click();
    render();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    box().click();
    render();
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.click();
    render();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(host.events).toEqual(['opened', 'closed', 'opened', 'closed', 'opened', 'closed', 'opened', 'closed']);
    await fixture.whenStable();
    render();
    expect(panel()).toBeNull();
  });

  it('keeps the panel mounted when it opens again before the leave ends', async () => {
    press('ArrowDown');
    press('Escape');
    press('ArrowDown');
    await Promise.resolve();
    render();
    expect(panel()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps focus on the field when the panel is pressed and closes on a container scroll', () => {
    key('ArrowDown');
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    panel()?.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    const insideBox = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(insideBox, 'target', { value: trigger() });
    component().onOutsideClick(insideBox);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    document.dispatchEvent(new Event('scroll'));
    render();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    fixture.nativeElement.querySelector('.scroller').dispatchEvent(new Event('scroll'));
    render();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('moves with Home, End and wrapping arrows past disabled items, and finds items by typing', () => {
    key('ArrowDown');
    expect(active()).toBe('Fruits');
    key('ArrowUp');
    expect(active()).toBe('Water');
    key('ArrowDown');
    expect(active()).toBe('Fruits');
    key('End');
    expect(active()).toBe('Water');
    key('Home');
    expect(active()).toBe('Fruits');
    key('w');
    expect(active()).toBe('Water');
    key('f', { ctrlKey: true });
    key('z');
    expect(active()).toBe('Water');
    key('ArrowRight');
    key('ArrowLeft');
    expect(active()).toBe('Water');
    expect(columns()).toHaveLength(1);
    key('Home');
    key('ArrowRight');
    expect(active()).toBe('Apple');
    key('ArrowDown');
    expect(active()).toBe('Plum');
    key('ArrowLeft');
    key('ArrowDown');
    expect(active()).toBe('Locked');
    key('ArrowRight');
    expect(columns()).toHaveLength(2);
    expect(active()).toBe('Locked');
    key('Enter');
    expect(active()).toBe('Locked');
    key('ArrowDown');
    expect(items(0)[2].textContent?.trim()).toBe('');
    key('Enter');
    expect(host.control.value).toBe('nameless');
    expect(trigger().textContent?.trim()).toBe('');
  });

  it('skips disabled items on hover and click and only chooses leaves', () => {
    trigger().click();
    render();
    items(0)[0].click();
    render();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(items(1)[1].getAttribute('aria-disabled')).toBe('true');
    items(1)[1].dispatchEvent(new MouseEvent('mouseenter'));
    items(1)[1].click();
    render();
    expect(active()).toBe('Fruits');
    expect(host.control.value).toBeNull();
    items(1)[2].click();
    render();
    expect(host.control.value).toBe('plum');
  });

  it('does nothing when the value is a disabled leaf or the column has no item', () => {
    host.control.setValue('pear');
    render();
    key('Enter');
    expect(active()).toBe('Pear');
    key('Enter');
    expect(host.control.value).toBe('pear');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('shows the empty message and keeps the keys quiet without options', () => {
    host.options.set([]);
    host.emptyMessage.set('Nothing here');
    render();
    key('ArrowDown');
    expect(document.querySelector('.tx-select__empty')?.textContent?.trim()).toBe('Nothing here');
    key('ArrowDown');
    key('Enter');
    key('x');
    expect(trigger().getAttribute('aria-activedescendant')).toBeNull();
    host.options.set([{ label: 'Off', value: 'off', disabled: true }]);
    key('Escape');
    key('ArrowDown');
    expect(active()).toBeUndefined();
    key('End');
    expect(active()).toBeUndefined();
  });

  it('stays closed while readonly or disabled and hides the clear button', () => {
    host.control.setValue('water');
    host.readonly.set(true);
    render();
    expect(fixture.nativeElement.querySelector('.tx-select__clear')).toBeNull();
    key('ArrowDown');
    box().click();
    render();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    host.readonly.set(false);
    host.control.disable();
    render();
    expect(fixture.nativeElement.querySelector('.tx-select__clear')).toBeNull();
    box().click();
    render();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('matches object values by the data key and shows no label for an unknown value', () => {
    host.options.set([{ label: 'First', value: { id: 1 } }, { label: 'Second', value: { id: 2 } }]);
    host.dataKey.set('id');
    host.control.setValue({ id: 2 });
    render();
    expect(trigger().textContent?.trim()).toBe('Second');
    host.control.setValue({ id: 3 });
    render();
    expect(trigger().textContent?.trim()).toBe('');
    expect(fixture.nativeElement.querySelector('.tx-cascade-select--filled')).not.toBeNull();
  });

  it('scrolls the active item into view', async () => {
    const scrolled: Element[] = [];
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
    Element.prototype.scrollIntoView = function (this: Element) {
      scrolled.push(this);
    };
    try {
      key('ArrowDown');
      key('ArrowDown');
      await Promise.resolve();
      expect(scrolled.at(-1)?.textContent?.trim()).toBe('Locked');
    } finally {
      if (original) {
        Object.defineProperty(Element.prototype, 'scrollIntoView', original);
      } else {
        delete (Element.prototype as Partial<Element>).scrollIntoView;
      }
    }
  });

  it('flips the panel when there is no room below', () => {
    const root = document.documentElement;
    const clientHeight = vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return this === root ? 600 : 0;
    });
    const clientWidth = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
      return this === root ? 800 : 0;
    });
    vi.spyOn(box(), 'getBoundingClientRect').mockReturnValue({ top: 500, left: 10, width: 200, height: 40 } as DOMRect);
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(100);
    try {
      key('ArrowDown');
      const select = component();
      expect(select.positions()[0].originY).toBe('top');
      select.onPositionChange({ connectionPair: select.positions()[0] } as ConnectedOverlayPositionChange);
      expect(select.placement()).toBe('top-start');
      select.onPositionChange({ connectionPair: { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' } } as ConnectedOverlayPositionChange);
      expect(select.placement()).toBe('bottom-start');
    } finally {
      height.mockRestore();
      clientHeight.mockRestore();
      clientWidth.mockRestore();
    }
  });
});

describe('TxCascadeSelect recompiled by TestBed', () => {
  it('still binds to a form control when a test overrides the component', () => {
    TestBed.overrideComponent(TxCascadeSelect, { set: { styles: [] } });
    const fixture = TestBed.createComponent(PlainHost);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue('water');
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLElement).textContent?.trim()).toBe('Water');
    (fixture.nativeElement.querySelector('.tx-select__clear') as HTMLButtonElement).click();
    expect(fixture.componentInstance.control.value).toBeNull();
  });
});
