import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { normalizeChecked } from './tree';
import { TxTreeSelect } from './tree-select.component';
import { TxTreeNode, TxTreeSelectionMode } from './tree-select.types';

const TREE: TxTreeNode[] = [
  {
    key: 'docs',
    label: 'Documents',
    children: [
      { key: 'cv', label: 'Resume.pdf' },
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
    expect(Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip')).map((chip) => (chip as HTMLElement).textContent?.trim())).toEqual(['Documents']);
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
