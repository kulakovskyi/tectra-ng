import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxTree } from './tree.component';
import { TxTreeNodeTemplate } from './tree.templates';
import { TxTreeFilterMode, TxTreeNode, TxTreeNodeDropEvent, TxTreeSelection, TxTreeSelectionMode } from './tree.types';
import { filterTree, moveNode, normalizeChecked, scopesMatch } from './tree.utils';

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
