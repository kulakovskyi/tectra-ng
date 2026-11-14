import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TxTreeNode, TxTreeSelectionMode, normalizeChecked } from '@tectra-ng/ui/tree';
import { TxTreeSelect } from './tree-select.component';
import { TxTreeSelectChangeEvent, TxTreeSelectDisplay } from './tree-select.types';

const TREE: TxTreeNode[] = [
  {
    key: 'docs',
    label: 'Documents',
    children: [
      { key: 'cv', label: 'Resume.pdf', data: { code: 'HR-7' } },
      { key: 'tax', label: 'Taxes', children: [{ key: 't24', label: '2024.xlsx' }, { key: 't25', label: '2025.xlsx' }] },
    ],
  },
  { key: 'photos', label: 'Photos', children: [{ key: 'sea', label: 'Sea.png' }] },
  { key: 'locked', label: 'Locked', disabled: true },
];

@Component({
  imports: [TxTreeSelect, ReactiveFormsModule],
  template: `<tx-tree-select
    [options]="tree"
    [formControl]="control"
    [selectionMode]="mode()"
    [filter]="filter()"
    [filterBy]="filterBy()"
    [display]="'chip'"
    [showClear]="true"
    [placeholder]="'File'"
    [(expandedKeys)]="expanded"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tree = TREE;
  control = new FormControl<string | string[] | null>(null);
  readonly mode = signal<TxTreeSelectionMode>('single');
  readonly filter = signal(false);
  readonly filterBy = signal('label');
  expanded: string[] = [];
}

describe('TxTreeSelect', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const items = () => Array.from(document.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
  const labels = () => items().map((item) => item.querySelector('.tx-tree-select__label')?.textContent);
  const render = () => fixture.detectChanges();
  const key = (name: string, target: HTMLElement = trigger()) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('expands with the arrows and picks one node', () => {
    key('ArrowDown');
    expect(document.querySelector('[role="tree"]')).not.toBeNull();
    expect(labels()).toEqual(['Documents', 'Photos', 'Locked']);
    expect(items()[0].getAttribute('aria-expanded')).toBe('false');
    key('ArrowRight');
    expect(labels()).toEqual(['Documents', 'Resume.pdf', 'Taxes', 'Photos', 'Locked']);
    expect(host.expanded).toEqual(['docs']);
    key('ArrowRight');
    key('ArrowDown');
    key('ArrowRight');
    key('ArrowRight');
    expect(items()[3].getAttribute('aria-level')).toBe('3');
    key('Enter');
    expect(host.control.value).toBe('t24');
    expect(trigger().textContent).toContain('2024.xlsx');
    key('ArrowDown');
    expect(document.querySelector('.tx-tree-select__node--active')?.textContent).toContain('2024.xlsx');
    key('ArrowLeft');
    expect(document.querySelector('.tx-tree-select__node--active')?.textContent).toContain('Taxes');
  });

  it('checks a branch with its children and shows partial parents', () => {
    host.mode.set('checkbox');
    host.expanded = ['docs', 'tax'];
    render();
    trigger().click();
    render();
    items()[2].click();
    render();
    expect(host.control.value).toEqual(['tax', 't24', 't25']);
    expect(items()[0].getAttribute('aria-checked')).toBe('mixed');
    items()[1].click();
    render();
    expect(host.control.value).toEqual(['docs', 'cv', 'tax', 't24', 't25']);
    expect(items()[0].getAttribute('aria-checked')).toBe('true');
    expect(Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip:not(.tx-select__chip--more)')).map((chip) => (chip as HTMLElement).textContent?.trim())).toEqual(['Documents']);
    items()[3].click();
    render();
    expect(host.control.value).toEqual(['cv', 't25']);
  });

  it('filters and keeps the ancestors of matches', () => {
    host.filter.set(true);
    host.mode.set('multiple');
    render();
    trigger().click();
    render();
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    search.value = '2025';
    search.dispatchEvent(new Event('input'));
    render();
    expect(labels()).toEqual(['Documents', 'Taxes', '2025.xlsx']);
    key('ArrowDown', search);
    key('ArrowDown', search);
    key('Enter', search);
    expect(host.control.value).toEqual(['t25']);
  });

  it('searches the fields named by filterBy', () => {
    host.filter.set(true);
    render();
    trigger().click();
    render();
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    search.value = 'hr-7';
    search.dispatchEvent(new Event('input'));
    render();
    expect(labels()).toEqual([]);
    host.filterBy.set('label, data.code');
    render();
    expect(labels()).toEqual(['Documents', 'Resume.pdf']);
  });

  it('skips disabled nodes and clears', () => {
    host.control.setValue('sea');
    render();
    trigger().click();
    render();
    expect(labels()).toContain('Sea.png');
    items().at(-1)?.click();
    render();
    expect(host.control.value).toBe('sea');
    (fixture.nativeElement.querySelector('.tx-select__clear') as HTMLButtonElement).click();
    render();
    expect(host.control.value).toBeNull();
  });

  it('normalizes checked keys up the tree', () => {
    expect(normalizeChecked(TREE, ['t24', 't25', 'cv'])).toEqual(['docs', 'cv', 'tax', 't24', 't25']);
  });
});

const FULL: TxTreeNode[] = [
  ...TREE,
  { key: 'shared', label: 'Shared', disabled: true, children: [{ key: 'team', label: 'Team' }] },
  { key: 'notes', label: 'Notes', selectable: false },
];

@Component({
  imports: [TxTreeSelect, ReactiveFormsModule],
  template: `<div class="scroller" style="overflow: auto">
    <tx-tree-select
      [options]="options()"
      [formControl]="control"
      [selectionMode]="mode()"
      [display]="display()"
      [filter]="filter()"
      [readonly]="readonly()"
      [emptyMessage]="emptyMessage()"
      [showClear]="true"
      placeholder="File"
      [(expandedKeys)]="expanded"
      (opened)="events.push('opened')"
      (closed)="events.push('closed')"
      (changed)="changes.push($event)"
    />
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FullHost {
  readonly options = signal<TxTreeNode[]>(FULL);
  readonly control = new FormControl<string | string[] | null>(null);
  readonly mode = signal<TxTreeSelectionMode>('single');
  readonly display = signal<TxTreeSelectDisplay>('comma');
  readonly filter = signal(false);
  readonly readonly = signal(false);
  readonly emptyMessage = signal<string | undefined>(undefined);
  readonly expanded = signal<string[]>([]);
  readonly events: string[] = [];
  readonly changes: TxTreeSelectChangeEvent[] = [];
}

describe('TxTreeSelect interactions', () => {
  let fixture: ComponentFixture<FullHost>;
  let host: FullHost;
  const component = () => fixture.debugElement.query(By.directive(TxTreeSelect)).componentInstance as TxTreeSelect;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const box = () => fixture.nativeElement.querySelector('.tx-select__box') as HTMLElement;
  const panel = () => document.querySelector('.tx-select__panel') as HTMLElement | null;
  const items = () => Array.from(document.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
  const row = (label: string) => items().find((item) => item.querySelector('.tx-tree-select__label')?.textContent === label) as HTMLElement;
  const active = () => document.querySelector('.tx-tree-select__node--active .tx-tree-select__label')?.textContent;
  const expanded = () => trigger().getAttribute('aria-expanded');
  const render = () => fixture.detectChanges();
  const key = (name: string, target: HTMLElement = trigger(), init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    render();
    return event;
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(FullHost);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('opens and closes with the box, Escape, Tab and outside clicks, then unmounts the panel', async () => {
    box().click();
    render();
    expect(expanded()).toBe('true');
    expect(document.activeElement).toBe(trigger());
    component().open();
    box().click();
    render();
    expect(expanded()).toBe('false');
    key('Enter');
    expect(key('Escape').defaultPrevented).toBe(true);
    expect(expanded()).toBe('false');
    key(' ');
    key('Tab');
    expect(expanded()).toBe('false');
    key('ArrowUp');
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.click();
    render();
    expect(expanded()).toBe('false');
    component().close();
    expect(host.events).toEqual(['opened', 'closed', 'opened', 'closed', 'opened', 'closed', 'opened', 'closed']);
    await fixture.whenStable();
    render();
    expect(panel()).toBeNull();
  });

  it('keeps the panel when it opens again before the leave ends, and closes before it renders', async () => {
    key('ArrowDown');
    key('Escape');
    key('ArrowDown');
    await fixture.whenStable();
    render();
    expect(panel()).not.toBeNull();
    key('Escape');
    component().open();
    component().close();
    await fixture.whenStable();
    render();
    expect(expanded()).toBe('false');
  });

  it('keeps focus on the field when the panel is pressed and closes on a container scroll', () => {
    host.filter.set(true);
    render();
    key('ArrowDown');
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    panel()?.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    const onInput = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    document.querySelector('.tx-select__filter-input')?.dispatchEvent(onInput);
    expect(onInput.defaultPrevented).toBe(false);
    const insideBox = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(insideBox, 'target', { value: trigger() });
    component().onOutsideClick(insideBox);
    expect(expanded()).toBe('true');
    document.dispatchEvent(new Event('scroll'));
    render();
    expect(expanded()).toBe('true');
    fixture.nativeElement.querySelector('.scroller').dispatchEvent(new Event('scroll'));
    render();
    expect(expanded()).toBe('false');
  });

  it('ignores the keyboard and the box when readonly or disabled', () => {
    host.readonly.set(true);
    render();
    expect(key('ArrowDown').defaultPrevented).toBe(false);
    box().click();
    render();
    expect(expanded()).toBe('false');
    host.readonly.set(false);
    host.control.disable();
    render();
    component().open();
    render();
    expect(expanded()).toBe('false');
  });

  it('expands and collapses with the toggler without picking', () => {
    key('ArrowDown');
    (row('Documents').querySelector('.tx-tree-select__toggler') as HTMLElement).click();
    render();
    expect(host.expanded()).toEqual(['docs']);
    expect(host.control.value).toBeNull();
    (row('Resume.pdf').querySelector('.tx-tree-select__toggler') as HTMLElement).click();
    render();
    expect(host.expanded()).toEqual(['docs']);
    (row('Documents').querySelector('.tx-tree-select__toggler') as HTMLElement).click();
    render();
    expect(host.expanded()).toEqual([]);
    expect(expanded()).toBe('true');
  });

  it('expands a disabled branch instead of picking it', () => {
    key('ArrowDown');
    row('Shared').click();
    render();
    expect(host.expanded()).toEqual(['shared']);
    expect(host.control.value).toBeNull();
    row('Notes').click();
    render();
    expect(host.control.value).toBeNull();
  });

  it('moves with Up, Page keys, Home, End, Left, Right and typing', () => {
    key('ArrowDown');
    expect(active()).toBe('Documents');
    key('ArrowUp');
    expect(active()).toBe('Documents');
    key('PageDown');
    expect(active()).toBe('Notes');
    key('PageUp');
    expect(active()).toBe('Documents');
    key('End');
    expect(active()).toBe('Notes');
    key('Home');
    expect(active()).toBe('Documents');
    key('ArrowRight');
    key('ArrowRight');
    expect(active()).toBe('Resume.pdf');
    key('ArrowRight');
    expect(active()).toBe('Resume.pdf');
    key('ArrowLeft');
    expect(active()).toBe('Documents');
    key('ArrowLeft');
    expect(host.expanded()).toEqual([]);
    key('ArrowLeft');
    expect(active()).toBe('Documents');
    key('p');
    expect(active()).toBe('Photos');
    key('z');
    expect(active()).toBe('Photos');
    key('l', trigger(), { ctrlKey: true });
    expect(active()).toBe('Photos');
    key(' ');
    expect(host.control.value).toBe('photos');
    expect(expanded()).toBe('false');
  });

  it('keeps arrow and Home keys for the text while filtering', () => {
    host.filter.set(true);
    render();
    key('ArrowDown');
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    for (const name of ['ArrowRight', 'ArrowLeft', 'Home', 'End', ' ', 'a']) {
      expect(key(name, search).defaultPrevented).toBe(false);
    }
    expect(active()).toBe('Documents');
  });

  it('activates the first selectable match, the first match, or nothing while filtering', () => {
    host.filter.set(true);
    host.expanded.set(['tax']);
    host.emptyMessage.set('Nothing found');
    render();
    key('ArrowDown');
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    const type = (text: string) => {
      search.value = text;
      search.dispatchEvent(new Event('input'));
      render();
    };
    type('tax');
    expect(items().map((item) => item.querySelector('.tx-tree-select__label')?.textContent)).toEqual(['Documents', 'Taxes', '2024.xlsx', '2025.xlsx']);
    expect(active()).toBe('Documents');
    type('locked');
    expect(active()).toBe('Locked');
    type('zzz');
    expect(active()).toBeUndefined();
    expect(document.querySelector('.tx-tree-select__empty')?.textContent?.trim()).toBe('Nothing found');
    expect(key('Enter', search).defaultPrevented).toBe(true);
    expect(host.control.value).toBeNull();
  });

  it('does nothing on row keys while there are no rows', async () => {
    host.options.set([]);
    render();
    key('ArrowDown');
    await fixture.whenStable();
    expect(document.querySelector('.tx-tree-select__empty')?.textContent?.trim()).toBe('No results found');
    expect(trigger().getAttribute('aria-activedescendant')).toBeNull();
    for (const name of ['ArrowRight', 'ArrowLeft', 'Enter', ' ', 'ArrowDown']) {
      key(name);
    }
    expect(host.control.value).toBeNull();
    expect(expanded()).toBe('true');
  });

  it('toggles nodes in multiple mode and removes chips with the mouse and Backspace', () => {
    host.mode.set('multiple');
    host.display.set('chip');
    render();
    expect(key('Backspace').defaultPrevented).toBe(false);
    key('ArrowDown');
    row('Documents').click();
    row('Photos').click();
    render();
    expect(host.control.value).toEqual(['docs', 'photos']);
    row('Documents').click();
    render();
    expect(host.control.value).toEqual(['photos']);
    row('Notes').click();
    row('Documents').click();
    render();
    key('Escape');
    const chips = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip:not(.tx-select__chip--more) .tx-select__chip-label')).map((chip) => (chip as HTMLElement).textContent);
    expect(chips()).toEqual(['Photos', 'Documents']);
    expect(fixture.nativeElement.querySelector('.tx-select__chip--more').classList).toContain('tx-select__chip--hidden');
    expect(key('Backspace').defaultPrevented).toBe(true);
    expect(chips()).toEqual(['Photos']);
    (fixture.nativeElement.querySelector('.tx-select__chip-remove') as HTMLElement).click();
    render();
    expect(host.control.value).toEqual([]);
    expect(expanded()).toBe('false');
    expect(host.changes.at(-1)?.node?.key).toBe('photos');
  });

  it('removes a checked chip with its descendants and unchecks its ancestors', () => {
    host.mode.set('checkbox');
    host.display.set('chip');
    host.control.setValue(['docs', 'cv', 'tax', 't24', 't25']);
    render();
    key('ArrowDown');
    expect(host.expanded()).toEqual(['docs', 'tax']);
    row('Taxes').click();
    render();
    expect(host.control.value).toEqual(['cv']);
    key('Escape');
    (fixture.nativeElement.querySelector('.tx-select__chip-remove') as HTMLElement).click();
    render();
    expect(host.control.value).toEqual([]);
    host.control.setValue(['t24']);
    render();
    key('Backspace');
    expect(host.control.value).toEqual([]);
  });

  it('clears to an empty list in multiple mode and keeps chips when readonly', () => {
    host.mode.set('multiple');
    host.control.setValue(['cv']);
    render();
    (fixture.nativeElement.querySelector('.tx-select__clear') as HTMLButtonElement).click();
    render();
    expect(host.control.value).toEqual([]);
    expect(document.activeElement).toBe(trigger());
    host.control.setValue(['cv']);
    host.readonly.set(true);
    render();
    component().removeNode(FULL[0].children?.[0] as TxTreeNode, new Event('click'));
    expect(host.control.value).toEqual(['cv']);
  });

  it('closes cleanly when it closes before the panel renders', async () => {
    component().open();
    component().close();
    await fixture.whenStable();
    render();
    expect(host.events).toEqual(['opened', 'closed']);
    expect(panel()).toBeNull();
  });

  it('treats an empty string as no value', () => {
    host.control.setValue('');
    render();
    expect(trigger().textContent?.trim()).toBe('File');
    expect(fixture.nativeElement.querySelector('.tx-select__clear')).toBeNull();
  });
});
