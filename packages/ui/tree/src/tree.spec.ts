import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxTreeDragService } from './tree-drag.service';
import { TxTree, TxTreeRow } from './tree.component';
import { TxTreeCheckboxIcon, TxTreeEmpty, TxTreeFilter, TxTreeFooter, TxTreeHeader, TxTreeLoading, TxTreeNodeTemplate, TxTreeToggleIcon } from './tree.templates';
import { TxTreeFilterEvent, TxTreeFilterMode, TxTreeLoadingMode, TxTreeNode, TxTreeNodeDropEvent, TxTreeNodeEvent, TxTreeScope, TxTreeSelection, TxTreeSelectionMode } from './tree.types';
import { descendantKeys, filterTree, insertNode, isDescendantOf, moveNode, nodeMatches, normalizeChecked, scopesMatch } from './tree.utils';

const TREE: TxTreeNode[] = [
  {
    key: 'docs',
    label: 'Documents',
    icon: 'folder',
    children: [
      { key: 'cv', label: 'Resume.pdf' },
      { key: 'tax', label: 'Taxes', children: [{ key: 't24', label: '2024.xlsx' }, { key: 't25', label: '2025.xlsx' }] },
    ],
  },
  { key: 'photos', label: 'Photos', children: [{ key: 'sea', label: 'Sea.png', type: 'image' }] },
  { key: 'lazy', label: 'Archive', leaf: false },
  { key: 'locked', label: 'Locked', disabled: true },
];

@Component({
  imports: [TxTree, TxTreeNodeTemplate],
  template: `<tx-tree
    ariaLabel="Files"
    [(value)]="value"
    [selectionMode]="mode()"
    [(selection)]="selection"
    [(expandedKeys)]="expanded"
    [metaKeySelection]="meta()"
    [filter]="filter()"
    [filterMode]="filterMode()"
    [filterInputAutoFocus]="autoFocus()"
    [contextMenu]="menu()"
    [draggableNodes]="drag()"
    [droppableNodes]="drag()"
    [validateDrop]="validate()"
    [virtualScroll]="virtual()"
    [scrollHeight]="virtual() ? '90px' : undefined"
    [dt]="{ root: { indent: '20px' } }"
    [pt]="{ content: { class: 'own-content' } }"
    (nodeExpand)="expandedEvents.push($event.node.key)"
    (nodeSelect)="selected.push($event.node.key)"
    (nodeDrop)="onDrop($event)"
  >
    <ng-template txTreeNode="image" let-node><b class="image">{{ node.label }}</b></ng-template>
  </tx-tree>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal(TREE);
  readonly selection = signal<TxTreeSelection>(null);
  readonly expanded = signal<string[]>([]);
  readonly mode = signal<TxTreeSelectionMode | undefined>('single');
  readonly meta = signal(false);
  readonly filter = signal(false);
  readonly filterMode = signal<TxTreeFilterMode>('lenient');
  readonly menu = signal<TxMenuItem[] | undefined>(undefined);
  readonly drag = signal(false);
  readonly validate = signal(false);
  readonly virtual = signal(false);
  readonly autoFocus = signal(false);
  expandedEvents: string[] = [];
  selected: string[] = [];
  drops: TxTreeNodeDropEvent[] = [];

  onDrop(event: TxTreeNodeDropEvent): void {
    this.drops.push(event);
  }
}

describe('TxTree', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const items = () => (Array.from(fixture.nativeElement.querySelectorAll('[role="treeitem"]')) as HTMLElement[]).filter((element) => !element.closest('[inert]'));
  const labels = () => items().map((item) => item.querySelector('.tx-tree__label')?.textContent?.trim());
  const item = (key: string) => fixture.nativeElement.querySelector(`[data-tree-key="${key}"]`) as HTMLElement;
  const content = (key: string) => item(key);
  const toggle = async (key: string) => {
    (item(key).querySelector('.tx-tree__toggler') as HTMLButtonElement).click();
    await render();
  };
  const key = async (name: string, target: HTMLElement, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
    await render();
  };
  const focused = () => (document.activeElement as HTMLElement | null)?.dataset['treeKey'];

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    await render();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('renders the root level as a tree with levels and sizes', async () => {
    const tree = fixture.nativeElement.querySelector('[role="tree"]') as HTMLElement;
    expect(tree.getAttribute('aria-label')).toBe('Files');
    expect(labels()).toEqual(['Documents', 'Photos', 'Archive', 'Locked']);
    expect(item('docs').getAttribute('aria-level')).toBe('1');
    expect(item('docs').getAttribute('aria-setsize')).toBe('4');
    expect(item('docs').getAttribute('aria-expanded')).toBe('false');
    expect(item('locked').getAttribute('aria-expanded')).toBeNull();
    expect(item('lazy').getAttribute('aria-expanded')).toBe('false');
    expect(item('docs').getAttribute('tabindex')).toBe('0');
    expect(item('photos').getAttribute('tabindex')).toBe('-1');
  });

  it('expands and collapses with the toggler and reports the keys', async () => {
    await toggle('docs');
    expect(host.expanded()).toEqual(['docs']);
    expect(host.expandedEvents).toEqual(['docs']);
    expect(labels()).toEqual(['Documents', 'Resume.pdf', 'Taxes', 'Photos', 'Archive', 'Locked']);
    expect(item('cv').getAttribute('aria-level')).toBe('2');
    expect(fixture.nativeElement.querySelector(`#${item('docs').getAttribute('aria-owns')}`)?.getAttribute('role')).toBe('group');
    await toggle('docs');
    expect(host.expanded()).toEqual([]);
    expect(labels()).toEqual(['Documents', 'Photos', 'Archive', 'Locked']);
  });

  it('opens nodes marked expanded in the value', async () => {
    host.value.set([{ key: 'a', label: 'A', expanded: true, children: [{ key: 'b', label: 'B' }] }]);
    await render();
    expect(host.expanded()).toEqual(['a']);
    expect(labels()).toEqual(['A', 'B']);
  });

  it('moves focus with arrows, Home, End and typing', async () => {
    item('docs').focus();
    await key('ArrowRight', item('docs'));
    expect(host.expanded()).toEqual(['docs']);
    await key('ArrowRight', item('docs'));
    expect(focused()).toBe('cv');
    await key('ArrowDown', item('cv'));
    expect(focused()).toBe('tax');
    await key('ArrowLeft', item('tax'));
    expect(focused()).toBe('docs');
    await key('ArrowLeft', item('docs'));
    expect(host.expanded()).toEqual([]);
    await key('End', item('docs'));
    expect(focused()).toBe('locked');
    await key('Home', item('locked'));
    expect(focused()).toBe('docs');
    await key('a', item('docs'));
    expect(focused()).toBe('lazy');
    await key('*', item('lazy'));
    expect(host.expanded()).toEqual(['docs', 'photos', 'lazy']);
  });

  it('selects one node, and unselects it on a second click without meta key selection', async () => {
    content('photos').click();
    await render();
    expect((host.selection() as TxTreeNode).key).toBe('photos');
    expect(item('photos').getAttribute('aria-selected')).toBe('true');
    expect(content('photos').classList).toContain('tx-tree__content--selected');
    content('photos').click();
    await render();
    expect(host.selection()).toBeNull();
    content('locked').click();
    await render();
    expect(host.selection()).toBeNull();
  });

  it('toggles nodes in multiple mode and replaces the selection with meta key selection', async () => {
    host.mode.set('multiple');
    await render();
    content('docs').click();
    content('photos').click();
    await render();
    expect((host.selection() as TxTreeNode[]).map((node) => node.key)).toEqual(['docs', 'photos']);
    host.meta.set(true);
    await render();
    content('lazy').click();
    await render();
    expect((host.selection() as TxTreeNode[]).map((node) => node.key)).toEqual(['lazy']);
    content('docs').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await render();
    expect((host.selection() as TxTreeNode[]).map((node) => node.key)).toEqual(['docs', 'lazy']);
    expect(fixture.nativeElement.querySelector('[role="tree"]').getAttribute('aria-multiselectable')).toBe('true');
  });

  it('propagates checkbox selection down and up with a partial state', async () => {
    host.mode.set('checkbox');
    host.expanded.set(['docs', 'tax']);
    await render();
    content('t24').click();
    await render();
    expect(item('tax').getAttribute('aria-checked')).toBe('mixed');
    expect(item('docs').getAttribute('aria-checked')).toBe('mixed');
    content('t25').click();
    await render();
    expect(item('tax').getAttribute('aria-checked')).toBe('true');
    content('docs').click();
    await render();
    expect((host.selection() as TxTreeNode[]).map((node) => node.key)).toEqual(['docs', 'cv', 'tax', 't24', 't25']);
    expect(content('docs').classList).not.toContain('tx-tree__content--selected');
    await key(' ', item('docs'));
    expect(host.selection()).toEqual([]);
  });

  it('filters leniently or strictly and expands the matches', async () => {
    host.filter.set(true);
    await render();
    const input = fixture.nativeElement.querySelector('.tx-tree__filter-input') as HTMLInputElement;
    input.value = 'tax';
    input.dispatchEvent(new Event('input'));
    await render();
    expect(labels()).toEqual(['Documents', 'Taxes', '2024.xlsx', '2025.xlsx']);
    host.filterMode.set('strict');
    await render();
    expect(labels()).toEqual(['Documents', 'Taxes']);
    input.value = 'nothing';
    input.dispatchEvent(new Event('input'));
    await render();
    expect(fixture.nativeElement.querySelector('.tx-tree__empty').textContent.trim()).toBe('No results found');
    expect(host.expanded()).toEqual([]);
  });

  it('shows a loader on a lazy node until its children arrive', async () => {
    await toggle('lazy');
    expect(item('lazy').getAttribute('aria-busy')).toBe('true');
    expect(item('lazy').querySelector('.tx-tree__toggler-icon--loading')).not.toBeNull();
    host.value.update((nodes) => nodes.map((node) => (node.key === 'lazy' ? { ...node, children: [{ key: 'old', label: 'Old.zip' }] } : node)));
    await render();
    expect(item('lazy').getAttribute('aria-busy')).toBeNull();
    expect(labels()).toContain('Old.zip');
  });

  it('renders own node templates per type', async () => {
    await toggle('photos');
    expect(item('sea').querySelector('b.image')?.textContent).toBe('Sea.png');
  });

  it('applies dt and pt', async () => {
    const tree = fixture.nativeElement.querySelector('tx-tree') as HTMLElement;
    expect(tree.style.getPropertyValue('--tx-tree-indent')).toBe('20px');
    expect(content('docs').classList).toContain('own-content');
    expect(tree.hasAttribute('data-styled')).toBe(true);
  });

  it('opens the context menu and sets the context selection', async () => {
    host.menu.set([{ label: 'Rename' }]);
    await render();
    content('photos').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
    await render();
    const tree = fixture.debugElement.children[0].componentInstance as TxTree;
    expect(tree.contextMenuSelection()?.key).toBe('photos');
    expect(content('photos').classList).toContain('tx-tree__content--context');
    document.querySelector('.cdk-overlay-container')?.replaceChildren();
  });

  it('moves nodes with Alt and the arrows when drag and drop is on', async () => {
    host.drag.set(true);
    await render();
    item('photos').focus();
    await key('ArrowUp', item('photos'), { altKey: true });
    expect(host.value().map((node) => node.key)).toEqual(['photos', 'docs', 'lazy', 'locked']);
    expect(host.drops[0].position).toBe('before');
    expect(host.drops[0].index).toBe(0);
    await key('ArrowDown', item('photos'), { altKey: true });
    await key('ArrowRight', item('photos'), { altKey: true });
    expect(host.value().map((node) => node.key)).toEqual(['docs', 'lazy', 'locked']);
    expect(host.value()[0].children?.map((node) => node.key)).toEqual(['cv', 'tax', 'photos']);
    expect(host.expanded()).toContain('docs');
    await key('ArrowLeft', item('photos'), { altKey: true });
    expect(host.value().map((node) => node.key)).toEqual(['docs', 'photos', 'lazy', 'locked']);
  });

  it('waits for accept when validateDrop is on', async () => {
    host.drag.set(true);
    host.validate.set(true);
    await render();
    item('photos').focus();
    await key('ArrowUp', item('photos'), { altKey: true });
    expect(host.value().map((node) => node.key)).toEqual(['docs', 'photos', 'lazy', 'locked']);
    host.drops[0].accept();
    await render();
    expect(host.value().map((node) => node.key)).toEqual(['photos', 'docs', 'lazy', 'locked']);
  });

  it('renders only a window of rows with virtual scroll', async () => {
    host.value.set(Array.from({ length: 200 }, (_, index) => ({ key: `n${index}`, label: `Node ${index}` })));
    host.virtual.set(true);
    await render();
    expect(items().length).toBeLessThan(40);
    expect((items()[0].parentElement as HTMLElement).style.height).toBe('30px');
    item('n0').focus();
    await key('End', item('n0'));
    expect(focused()).toBe('n199');
  });

  const tree = () => fixture.debugElement.query(By.directive(TxTree)).componentInstance as TxTree;

  it('handles Up, Enter, typing without a match and keys from inner elements', async () => {
    item('photos').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await render();
    expect(focused()).toBe('docs');
    await key('Enter', item('docs'));
    expect((host.selection() as TxTreeNode).key).toBe('docs');
    await key('z', item('docs'));
    expect(focused()).toBe('docs');
    await key('p', item('docs'), { ctrlKey: true });
    expect(focused()).toBe('docs');
    await key('ArrowDown', item('docs').querySelector('.tx-tree__toggler') as HTMLElement);
    expect(focused()).toBe('docs');
    await key('F10', item('docs'));
    expect(fixture.nativeElement.querySelector('.tx-tree__content--context')).toBeNull();
  });

  it('ignores keys on rows of a collapsed branch and unmounts them after the transition', async () => {
    await toggle('docs');
    await toggle('docs');
    const cv = item('cv');
    expect(cv).not.toBeNull();
    await key('ArrowDown', cv);
    expect(focused()).not.toBe('tax');
    const collapse = item('docs').parentElement?.querySelector('.tx-tree__collapse') as HTMLElement;
    const transition = (target: HTMLElement, propertyName: string) => {
      const event = new Event('transitionend', { bubbles: true });
      Object.defineProperty(event, 'propertyName', { value: propertyName });
      target.dispatchEvent(event);
    };
    transition(collapse.querySelector('.tx-tree__collapse-inner') as HTMLElement, 'grid-template-rows');
    transition(collapse, 'opacity');
    await render();
    expect(item('cv')).not.toBeNull();
    transition(collapse, 'grid-template-rows');
    await render();
    expect(item('cv')).toBeNull();
  });

  it('keeps an open branch mounted when its transition ends', async () => {
    await toggle('docs');
    const collapse = item('docs').parentElement?.querySelector('.tx-tree__collapse') as HTMLElement;
    const event = new Event('transitionend');
    Object.defineProperty(event, 'propertyName', { value: 'grid-template-rows' });
    collapse.dispatchEvent(event);
    await render();
    expect(item('cv')).not.toBeNull();
  });

  it('does nothing when the toggler of a leaf is clicked', async () => {
    await toggle('locked');
    expect(host.expanded()).toEqual([]);
    expect(host.expandedEvents).toEqual([]);
  });

  it('expands and collapses everything through the API, ignoring rows in the wrong state', async () => {
    tree().expandAll();
    await render();
    expect(host.expanded()).toEqual(['docs', 'tax', 'photos']);
    const event = new Event('click');
    const row = (rowKey: string) => tree().rows().find((entry) => entry.node.key === rowKey) as TxTreeRow;
    tree().expand(row('docs'), event);
    tree().expand(row('cv'), event);
    tree().collapse(row('lazy'), event);
    expect(host.expandedEvents).toEqual([]);
    tree().collapseAll();
    await render();
    expect(labels()).toEqual(['Documents', 'Photos', 'Archive', 'Locked']);
  });

  it('emits double clicks', async () => {
    const events: TxTreeNodeEvent[] = [];
    tree().nodeDoubleClick.subscribe((event) => events.push(event));
    content('photos').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(events.map((event) => event.node.key)).toEqual(['photos']);
  });

  it('keeps the native context menu without menu items', async () => {
    host.menu.set([]);
    await render();
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    content('photos').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('opens the context menu from the keyboard next to the node', async () => {
    host.menu.set([{ label: 'Rename' }]);
    await render();
    item('photos').focus();
    await key('ContextMenu', item('photos'));
    await new Promise((resolve) => setTimeout(resolve));
    expect(tree().contextMenuSelection()?.key).toBe('photos');
    expect(content('photos').classList).toContain('tx-tree__content--context');
    await key('F10', item('photos'), { shiftKey: true });
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.querySelectorAll('body > div[style*="position: fixed"]').length).toBe(1);
    (document.querySelector('tx-menu-list [role="menuitem"]') as HTMLElement).click();
    await render();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await render();
    expect(document.querySelectorAll('body > div[style*="position: fixed"]').length).toBe(0);
  });

  it('runs a context menu command and focuses the node when the menu closes', async () => {
    const picked: string[] = [];
    host.menu.set([{ label: 'Rename', command: () => picked.push('rename') }]);
    await render();
    (document.activeElement as HTMLElement | null)?.blur();
    content('docs').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await render();
    await new Promise((resolve) => setTimeout(resolve));
    expect(tree().contextMenuSelection()?.key).toBe('docs');
    (document.querySelector('tx-menu-list [role="menuitem"]') as HTMLElement).click();
    await render();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await render();
    expect(picked).toEqual(['rename']);
    expect(fixture.nativeElement.querySelector('.tx-tree__content--context')).toBeNull();
    expect(focused()).toBe('docs');
  });

  it('keeps focus where it is when the context menu closes onto the tree', async () => {
    host.menu.set([{ label: 'Rename' }]);
    await render();
    content('photos').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 5, clientY: 5 }));
    await render();
    await new Promise((resolve) => setTimeout(resolve));
    item('lazy').focus();
    item('lazy').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await render();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await render();
    expect(tree().menuOpen()).toBe(false);
    expect(focused()).toBe('lazy');
  });

  it('unselects a single node only with the meta key under meta key selection', async () => {
    host.meta.set(true);
    await render();
    content('photos').click();
    await render();
    content('photos').click();
    await render();
    expect((host.selection() as TxTreeNode).key).toBe('photos');
    content('photos').dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }));
    await render();
    expect(host.selection()).toBeNull();
  });

  it('keeps a lone selection under meta key selection and unselects in multiple mode', async () => {
    host.mode.set('multiple');
    host.meta.set(true);
    await render();
    content('docs').click();
    await render();
    content('docs').click();
    await render();
    expect((host.selection() as TxTreeNode[]).map((node) => node.key)).toEqual(['docs']);
    host.meta.set(false);
    await render();
    content('docs').click();
    await render();
    expect(host.selection()).toEqual([]);
  });

  it('turns a single selected node into a list in multiple mode', async () => {
    host.selection.set(TREE[1]);
    host.mode.set('multiple');
    await render();
    content('docs').click();
    await render();
    expect((host.selection() as TxTreeNode[]).map((node) => node.key)).toEqual(['docs', 'photos']);
  });

  it('focuses the filter on init and moves into the tree with Down', async () => {
    fixture.nativeElement.remove();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    host.filter.set(true);
    host.autoFocus.set(true);
    document.body.appendChild(fixture.nativeElement);
    await render();
    const input = fixture.nativeElement.querySelector('.tx-tree__filter-input') as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    const other = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    input.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    await render();
    expect(focused()).toBe('docs');
  });

  it('expands and collapses filtered branches without touching the expanded keys', async () => {
    host.filter.set(true);
    await render();
    expect(tree().filterExpanded().size).toBe(0);
    const filtered: TxTreeFilterEvent[] = [];
    tree().filtered.subscribe((event) => filtered.push(event));
    const input = fixture.nativeElement.querySelector('.tx-tree__filter-input') as HTMLInputElement;
    input.value = 'xlsx';
    input.dispatchEvent(new Event('input'));
    await render();
    expect(filtered[0].filter).toBe('xlsx');
    expect(labels()).toEqual(['Documents', 'Taxes', '2024.xlsx', '2025.xlsx']);
    await toggle('tax');
    expect(labels()).toEqual(['Documents', 'Taxes']);
    await toggle('tax');
    expect(labels()).toEqual(['Documents', 'Taxes', '2024.xlsx', '2025.xlsx']);
    expect(host.expanded()).toEqual([]);
    expect(host.expandedEvents).toEqual(['tax']);
    tree().resetFilter();
    await render();
    expect(input.value).toBe('');
    expect(labels()).toEqual(['Documents', 'Photos', 'Archive', 'Locked']);
    input.value = 'nothing';
    input.dispatchEvent(new Event('input'));
    await render();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    await render();
    expect(document.activeElement).not.toBe(item('docs'));
  });

  it('shows the empty message for an empty tree', async () => {
    host.value.set([]);
    await render();
    expect(tree().tabKey()).toBeNull();
    expect(fixture.nativeElement.querySelector('.tx-tree__empty').textContent.trim()).toBe('No results found');
  });

  it('skips nodes that cannot move with Alt and the arrows', async () => {
    host.drag.set(true);
    host.value.set([
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B', droppable: false },
      { key: 'c', label: 'C' },
      { key: 'd', label: 'D', disabled: true },
    ]);
    await render();
    item('a').focus();
    await key('ArrowUp', item('a'), { altKey: true });
    await key('ArrowLeft', item('a'), { altKey: true });
    expect(host.drops).toEqual([]);
    await key('ArrowRight', item('c'), { altKey: true });
    await key('ArrowDown', item('d'), { altKey: true });
    expect(host.drops).toEqual([]);
    expect(focused()).toBe('d');
    await key('ArrowLeft', item('a'));
    expect(host.value().map((node) => node.key)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('works out the window only for virtual scroll', async () => {
    expect(tree().visibleRows().length).toBe(tree().rows().length);
    const wrapper = fixture.nativeElement.querySelector('.tx-tree__wrapper') as HTMLElement;
    wrapper.dispatchEvent(new Event('scroll'));
    expect(tree().scrollTop()).toBe(0);
  });

  it('follows the scroll position and scrolls focused rows into view with virtual scroll', async () => {
    host.value.set(Array.from({ length: 200 }, (_, index) => ({ key: `n${index}`, label: `Node ${index}` })));
    host.virtual.set(true);
    await render();
    const wrapper = fixture.nativeElement.querySelector('.tx-tree__wrapper') as HTMLElement;
    Object.defineProperty(wrapper, 'scrollTop', { value: 600, writable: true, configurable: true });
    Object.defineProperty(wrapper, 'clientHeight', { value: 90, configurable: true });
    wrapper.dispatchEvent(new Event('scroll'));
    await render();
    expect(items()[0].dataset['treeKey']).toBe('n10');
    tree().focusKey('missing');
    await render();
    expect(wrapper.scrollTop).toBe(600);
    item('n20').focus();
    await key('Home', item('n20'));
    expect(wrapper.scrollTop).toBe(0);
    expect(focused()).toBe('n0');
    await key('ArrowDown', item('n0'));
    expect(wrapper.scrollTop).toBe(0);
    expect(focused()).toBe('n1');
  });
});

describe('tree utils', () => {
  it('filters in lenient and strict mode', async () => {
    expect(filterTree(TREE, 'docu', ['label'])[0].children?.length).toBe(2);
    expect(filterTree(TREE, 'docu', ['label'], 'strict')[0].children).toEqual([]);
    expect(filterTree(TREE, '2025', ['label'])[0].children?.[0].children?.map((node) => node.key)).toEqual(['t25']);
  });

  it('moves a node but never into itself', async () => {
    expect(moveNode(TREE, 'docs', 'tax', 'inside')).toEqual(TREE);
    const moved = moveNode(TREE, 'sea', 'docs', 'before');
    expect(moved.map((node) => node.key)).toEqual(['sea', 'docs', 'photos', 'lazy', 'locked']);
    expect(moved[2].children).toEqual([]);
  });

  it('settles checked parents', async () => {
    expect(normalizeChecked(TREE, ['t24', 't25'])).toEqual(['tax', 't24', 't25']);
  });

  it('matches drag scopes', async () => {
    expect(scopesMatch(undefined, undefined)).toBe(true);
    expect(scopesMatch(undefined, 'files')).toBe(false);
    expect(scopesMatch(['a', 'files'], 'files')).toBe(true);
  });
});

describe('tree utils edge cases', () => {
  it('handles missing fields, empty queries, unknown keys and nested targets', () => {
    expect(nodeMatches({ key: 'a', label: 'A' }, 'a', ['missing'])).toBe(false);
    expect(filterTree(TREE, '  ', ['label'])).toEqual(TREE);
    expect(isDescendantOf(TREE, 'missing', 'cv')).toBe(false);
    const node = { key: 'new', label: 'New' };
    expect(insertNode(TREE, node, null, 'inside').map((item) => item.key)).toEqual(['docs', 'photos', 'lazy', 'locked', 'new']);
    expect(insertNode(TREE, node, 'locked', 'inside')[3].children).toEqual([node]);
    expect(insertNode(TREE, node, 't24', 'after')[0].children?.[1].children?.map((item) => item.key)).toEqual(['t24', 'new', 't25']);
    expect(scopesMatch('files', ['files'])).toBe(true);
    expect(scopesMatch(['a'], 'b')).toBe(false);
    const parent = { key: 'p', label: 'P', children: [{ key: 'x', label: 'X', disabled: true }, { key: 'y', label: 'Y', selectable: false }, { key: 'z', label: 'Z' }] };
    expect(descendantKeys(parent)).toEqual(['z']);
  });
});

@Component({
  imports: [TxTree, TxTreeHeader, TxTreeFooter, TxTreeEmpty, TxTreeLoading, TxTreeFilter, TxTreeToggleIcon, TxTreeCheckboxIcon, TxTreeNodeTemplate],
  template: `<tx-tree
    [(value)]="value"
    selectionMode="checkbox"
    [(selection)]="selection"
    [(expandedKeys)]="expanded"
    [propagateSelectionUp]="up()"
    [propagateSelectionDown]="down()"
    [loading]="loading()"
    [loadingMode]="loadingMode()"
    [highlightOnSelect]="true"
    [unstyled]="true"
    filter
    emptyMessage="Empty"
  >
    <ng-template txTreeHeader><span class="head">Head</span></ng-template>
    <ng-template txTreeFooter><span class="foot">Foot</span></ng-template>
    <ng-template txTreeEmpty><span class="nothing">Nothing here</span></ng-template>
    <ng-template txTreeLoading><span class="wait">Wait</span></ng-template>
    <ng-template txTreeFilter let-query let-filter="filter" let-reset="reset">
      <button type="button" class="find" (click)="filter('2024')">{{ query || 'all' }}</button>
      <button type="button" class="clear" (click)="reset()">Clear</button>
    </ng-template>
    <ng-template txTreeToggleIcon let-expanded let-busy="loading">
      <i class="toggle">{{ expanded ? 'open' : 'closed' }}{{ busy ? ' busy' : '' }}</i>
    </ng-template>
    <ng-template txTreeCheckboxIcon let-checked let-partial="partial">
      <i class="box">{{ checked ? 'on' : partial ? 'some' : 'off' }}</i>
    </ng-template>
    <ng-template txTreeNode let-node let-level="level">
      <em class="any">{{ node.label }}:{{ level }}</em>
    </ng-template>
  </tx-tree>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplatesHost {
  readonly value = signal<TxTreeNode[]>(TREE);
  readonly selection = signal<TxTreeSelection>(null);
  readonly expanded = signal<string[]>(['docs', 'tax']);
  readonly up = signal(true);
  readonly down = signal(true);
  readonly loading = signal(false);
  readonly loadingMode = signal<TxTreeLoadingMode>('mask');
}

describe('TxTree templates', () => {
  let fixture: ComponentFixture<TemplatesHost>;
  let host: TemplatesHost;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement | null;
  const item = (key: string) => fixture.nativeElement.querySelector(`[data-tree-key="${key}"]`) as HTMLElement;
  const keys = () => (host.selection() as TxTreeNode[]).map((node) => node.key);

  beforeEach(async () => {
    fixture = TestBed.createComponent(TemplatesHost);
    host = fixture.componentInstance;
    await render();
  });

  it('renders header, footer, toggle, checkbox and node templates', async () => {
    expect(el('.head')?.textContent).toBe('Head');
    expect(el('.foot')?.textContent).toBe('Foot');
    expect(el('tx-tree')?.hasAttribute('data-styled')).toBe(false);
    expect(item('docs').querySelector('.toggle')?.textContent).toBe('open');
    expect(item('photos').querySelector('.toggle')?.textContent).toBe('closed');
    expect(item('cv').querySelector('.any')?.textContent).toBe('Resume.pdf:2');
    item('t24').click();
    await render();
    expect(item('t24').querySelector('.box')?.textContent).toBe('on');
    expect(item('tax').querySelector('.box')?.textContent).toBe('some');
    expect(item('t24').classList).toContain('tx-tree__content--selected');
    item('lazy').querySelector<HTMLButtonElement>('.tx-tree__toggler')?.click();
    await render();
    expect(item('lazy').querySelector('.toggle')?.textContent).toBe('open busy');
  });

  it('checks without propagating down or up', async () => {
    host.down.set(false);
    host.up.set(false);
    await render();
    item('tax').click();
    await render();
    expect(keys()).toEqual(['tax']);
    expect(item('docs').getAttribute('aria-checked')).toBe('false');
    item('t24').click();
    item('t25').click();
    await render();
    expect(keys()).toEqual(['tax', 't24', 't25']);
    item('tax').click();
    await render();
    expect(keys()).toEqual(['t24', 't25']);
  });

  it('shows a loading mask with its template only in mask mode', async () => {
    host.loading.set(true);
    await render();
    expect(el('.tx-tree__mask .wait')?.textContent).toBe('Wait');
    expect(el('[role="tree"]')?.getAttribute('aria-busy')).toBe('true');
    host.loadingMode.set('icon');
    await render();
    expect(el('.tx-tree__mask')).toBeNull();
  });

  it('renders the empty template', async () => {
    host.value.set([]);
    await render();
    expect(el('.tx-tree__empty .nothing')?.textContent).toBe('Nothing here');
  });

  it('filters and resets through the filter template', async () => {
    expect(el('.find')?.textContent).toBe('all');
    el('.find')?.click();
    await render();
    expect(el('.find')?.textContent).toBe('2024');
    expect(fixture.nativeElement.querySelectorAll('[role="treeitem"]').length).toBe(3);
    el('.clear')?.click();
    await render();
    expect(el('.find')?.textContent).toBe('all');
  });
});

@Component({
  imports: [TxTree],
  template: `
    <tx-tree
      class="left"
      [(value)]="left"
      [(expandedKeys)]="leftExpanded"
      draggableNodes
      droppableNodes
      [draggableScope]="dragScope()"
      [droppableScope]="leftDrop()"
      (nodeDrop)="drops.push($event)"
    />
    <tx-tree
      class="right"
      [(value)]="right"
      [(expandedKeys)]="rightExpanded"
      draggableNodes
      droppableNodes
      [droppableScope]="rightDrop()"
      [validateDrop]="validate()"
      (nodeDrop)="drops.push($event)"
    />
    <tx-tree class="plain" [value]="plain" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DragHost {
  readonly left = signal<TxTreeNode[]>([
    { key: 'docs', label: 'Documents', children: [{ key: 'cv', label: 'Resume.pdf' }, { key: 'tax', label: 'Taxes', children: [{ key: 't24', label: '2024' }] }] },
    { key: 'pics', label: 'Pictures', droppable: false },
    { key: 'locked', label: 'Locked', disabled: true },
  ]);
  readonly right = signal<TxTreeNode[]>([
    { key: 'r1', label: 'Inbox' },
    { key: 'r2', label: 'Sent', children: [{ key: 'r21', label: 'Old' }] },
  ]);
  readonly plain: TxTreeNode[] = [{ key: 'p1', label: 'Plain' }];
  readonly leftExpanded = signal<string[]>(['docs', 'tax']);
  readonly rightExpanded = signal<string[]>(['r2']);
  readonly dragScope = signal<TxTreeScope>(undefined);
  readonly leftDrop = signal<TxTreeScope>(undefined);
  readonly rightDrop = signal<TxTreeScope>(undefined);
  readonly validate = signal(false);
  readonly drops: TxTreeNodeDropEvent[] = [];
}

describe('TxTree drag and drop', () => {
  let fixture: ComponentFixture<DragHost>;
  let host: DragHost;
  let service: TxTreeDragService;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const item = (tree: string, key: string) => fixture.nativeElement.querySelector(`.${tree} [data-tree-key="${key}"]`) as HTMLElement;
  const wrapper = (tree: string) => fixture.nativeElement.querySelector(`.${tree} .tx-tree__wrapper`) as HTMLElement;
  const keys = (nodes: TxTreeNode[]) => nodes.map((node) => node.key);
  const drag = (type: string, init: MouseEventInit = {}, dataTransfer: Partial<DataTransfer> | null = { setData: vi.fn(), effectAllowed: 'none', dropEffect: 'none' }) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
    if (dataTransfer) Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
    return event;
  };
  const fire = async (target: HTMLElement, event: Event) => {
    target.dispatchEvent(event);
    await render();
    return event;
  };
  const sized = (element: HTMLElement) => {
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 0, height: 40, left: 0, bottom: 40, right: 100, width: 100, x: 0, y: 0, toJSON: () => ({}) });
    return element;
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(DragHost);
    host = fixture.componentInstance;
    service = TestBed.inject(TxTreeDragService);
    await render();
  });

  afterEach(() => {
    fixture.destroy();
    service.stop();
  });

  it('starts a drag only on draggable nodes', async () => {
    const blocked = await fire(item('left', 'locked'), drag('dragstart'));
    expect(blocked.defaultPrevented).toBe(true);
    expect(service.state()).toBeNull();
    const transfer = { setData: vi.fn(), effectAllowed: 'none' as DataTransfer['effectAllowed'] };
    await fire(item('left', 'cv'), drag('dragstart', {}, transfer));
    expect(transfer.setData).toHaveBeenCalledWith('text/plain', 'Resume.pdf');
    expect(transfer.effectAllowed).toBe('move');
    expect(item('left', 'cv').classList).toContain('tx-tree__content--dragging');
    expect(service.state()?.node.key).toBe('cv');
    await fire(item('left', 'cv'), drag('dragend'));
    expect(item('left', 'cv').classList).not.toContain('tx-tree__content--dragging');
    expect(service.state()).toBeNull();
  });

  it('shows before, inside and after drop points from the pointer position', async () => {
    await fire(item('left', 'cv'), drag('dragstart', {}, null));
    const target = sized(item('right', 'r1'));
    const transfer = { dropEffect: 'none' as DataTransfer['dropEffect'] };
    const over = await fire(target, drag('dragover', { clientY: 2 }, transfer));
    expect(over.defaultPrevented).toBe(true);
    expect(transfer.dropEffect).toBe('move');
    expect(target.querySelector('.tx-tree__drop-point')).not.toBeNull();
    expect(target.querySelector('.tx-tree__drop-point--after')).toBeNull();
    await fire(target, drag('dragover', { clientY: 2 }, null));
    expect(target.querySelector('.tx-tree__drop-point')).not.toBeNull();
    await fire(target, drag('dragover', { clientY: 38 }));
    expect(target.querySelector('.tx-tree__drop-point--after')).not.toBeNull();
    await fire(target, drag('dragover', { clientY: 20 }));
    expect(target.classList).toContain('tx-tree__content--drop-inside');
    await fire(target, drag('dragleave', { relatedTarget: target.querySelector('.tx-tree__label') }));
    expect(target.classList).toContain('tx-tree__content--drop-inside');
    await fire(item('right', 'r2'), drag('dragleave', { bubbles: false }));
    expect(target.classList).toContain('tx-tree__content--drop-inside');
    await fire(target, drag('dragleave', { relatedTarget: document.body }));
    expect(target.classList).not.toContain('tx-tree__content--drop-inside');
  });

  it('only drops before or after a node that takes no children', async () => {
    await fire(item('left', 'cv'), drag('dragstart'));
    const target = sized(item('left', 'pics'));
    await fire(target, drag('dragover', { clientY: 15 }));
    expect(target.querySelector('.tx-tree__drop-point--after')).toBeNull();
    expect(target.querySelector('.tx-tree__drop-point')).not.toBeNull();
    await fire(target, drag('dragover', { clientY: 25 }));
    expect(target.querySelector('.tx-tree__drop-point--after')).not.toBeNull();
    await fire(item('left', 'docs'), drag('dragover'));
    expect(item('left', 'docs').classList).toContain('tx-tree__content--drop-inside');
  });

  it('refuses drops onto the node itself or its descendants', async () => {
    await fire(item('left', 'docs'), drag('dragstart'));
    await fire(item('left', 'docs'), drag('dragover'));
    const onSelf = await fire(item('left', 'docs'), drag('dragover'));
    expect(onSelf.defaultPrevented).toBe(false);
    const onChild = await fire(item('left', 't24'), drag('dragover'));
    expect(onChild.defaultPrevented).toBe(false);
    const drop = await fire(item('left', 't24'), drag('drop'));
    expect(drop.defaultPrevented).toBe(false);
    expect(host.drops).toEqual([]);
  });

  it('moves a node inside another node of the same tree and expands it', async () => {
    await fire(item('left', 'cv'), drag('dragstart'));
    await fire(item('left', 'pics'), drag('dragover', {}, null));
    await fire(item('left', 'docs'), drag('dragover'));
    const drop = await fire(item('left', 'docs'), drag('drop'));
    expect(drop.defaultPrevented).toBe(true);
    expect(service.state()).toBeNull();
    expect(host.drops[0].dropNode?.key).toBe('docs');
    expect(host.drops[0].position).toBe('inside');
    expect(keys(host.left()[0].children ?? [])).toEqual(['tax', 'cv']);
    expect(host.leftExpanded()).toEqual(['docs', 'tax']);
  });

  it('drops onto the empty area of a tree as the last root node', async () => {
    await fire(item('left', 'cv'), drag('dragstart'));
    const area = wrapper('left');
    const transfer = { dropEffect: 'none' as DataTransfer['dropEffect'] };
    const over = await fire(area, drag('dragover', {}, transfer));
    expect(over.defaultPrevented).toBe(true);
    expect(transfer.dropEffect).toBe('move');
    expect(area.classList).toContain('tx-tree__wrapper--drop');
    await fire(area, drag('dragover', {}, null));
    await fire(area, drag('dragleave', { relatedTarget: item('left', 'docs') }));
    expect(area.classList).toContain('tx-tree__wrapper--drop');
    await fire(area, drag('dragleave'));
    expect(area.classList).not.toContain('tx-tree__wrapper--drop');
    await fire(area, drag('dragover'));
    await fire(area, drag('drop'));
    expect(host.drops[0].dropNode).toBeNull();
    expect(keys(host.left())).toEqual(['docs', 'pics', 'locked', 'cv']);
    expect(host.drops[0].index).toBe(3);
  });

  it('moves a node into another tree inside a leaf', async () => {
    await fire(item('left', 'cv'), drag('dragstart'));
    await fire(item('right', 'r1'), drag('dragover'));
    await fire(item('right', 'r1'), drag('drop'));
    expect(keys(host.left()[0].children ?? [])).toEqual(['tax']);
    expect(keys(host.right()[0].children ?? [])).toEqual(['cv']);
    expect(host.rightExpanded()).toEqual(['r2', 'r1']);
    await fire(item('left', 'tax'), drag('dragstart'));
    await fire(item('right', 'r2'), drag('dragover'));
    await fire(item('right', 'r2'), drag('drop'));
    expect(keys(host.right()[1].children ?? [])).toEqual(['r21', 'tax']);
    expect(host.rightExpanded()).toEqual(['r2', 'r1']);
  });

  it('waits for accept before moving across trees', async () => {
    host.validate.set(true);
    await render();
    await fire(item('left', 'cv'), drag('dragstart'));
    await fire(item('right', 'r1'), drag('dragover', { clientY: -1 }));
    sized(item('right', 'r1'));
    await fire(item('right', 'r1'), drag('dragover', { clientY: 39 }));
    await fire(item('right', 'r1'), drag('drop'));
    expect(keys(host.right())).toEqual(['r1', 'r2']);
    host.drops[0].accept();
    await render();
    expect(keys(host.right())).toEqual(['r1', 'cv', 'r2']);
    expect(keys(host.left()[0].children ?? [])).toEqual(['tax']);
  });

  it('respects drag and drop scopes', async () => {
    host.dragScope.set('files');
    host.rightDrop.set('mail');
    host.leftDrop.set('files');
    await render();
    await fire(item('left', 'cv'), drag('dragstart'));
    const refused = await fire(item('right', 'r1'), drag('dragover'));
    expect(refused.defaultPrevented).toBe(false);
    const area = await fire(wrapper('right'), drag('dragover'));
    expect(area.defaultPrevented).toBe(false);
    const allowed = await fire(item('left', 'pics'), drag('dragover'));
    expect(allowed.defaultPrevented).toBe(true);
  });

  it('ignores drags over a tree without droppable nodes or without a drag', async () => {
    const idle = await fire(item('right', 'r1'), drag('dragover'));
    expect(idle.defaultPrevented).toBe(false);
    const idleArea = await fire(wrapper('right'), drag('dragover'));
    expect(idleArea.defaultPrevented).toBe(false);
    await fire(item('left', 'cv'), drag('dragstart'));
    const plain = await fire(item('plain', 'p1'), drag('dragover'));
    expect(plain.defaultPrevented).toBe(false);
    const plainArea = await fire(wrapper('plain'), drag('dragover'));
    expect(plainArea.defaultPrevented).toBe(false);
    await fire(item('right', 'r1'), drag('dragend'));
    expect(service.state()?.node.key).toBe('cv');
  });

  it('stops the drag when the source tree is destroyed', async () => {
    await fire(item('left', 'cv'), drag('dragstart'));
    fixture.destroy();
    expect(service.state()).toBeNull();
  });
});

describe('tree template directives', () => {
  it('narrow their template contexts', () => {
    expect(TxTreeNodeTemplate.ngTemplateContextGuard({} as TxTreeNodeTemplate<string>, { $implicit: { key: 'a', label: 'A' } })).toBe(true);
    expect(TxTreeFilter.ngTemplateContextGuard({} as TxTreeFilter, { $implicit: '' })).toBe(true);
    expect(TxTreeToggleIcon.ngTemplateContextGuard({} as TxTreeToggleIcon, { $implicit: true })).toBe(true);
    expect(TxTreeCheckboxIcon.ngTemplateContextGuard({} as TxTreeCheckboxIcon, undefined)).toBe(false);
  });
});
