import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  TxKanbanCard,
  TxKanbanColumnFooter,
  TxKanbanColumnHeader,
  TxKanbanColumnTop,
  TxKanbanEmpty,
} from './kanban-templates.directive';
import { TxKanban } from './kanban.component';
import { TxKanbanColumn, TxKanbanColumnDrop, TxKanbanItemDrop } from './kanban.types';

interface Task {
  id: string;
  title: string;
}

@Component({
  imports: [TxKanban, TxKanbanCard, TxKanbanColumnTop, TxKanbanEmpty],
  template: `
    <tx-kanban
      itemsDraggable
      columnsDraggable
      [columns]="columns()"
      [itemId]="taskId"
      [pageSize]="2"
      (itemDropped)="drops.push($event)"
      (columnDropped)="columnDrops.push($event)"
    >
      <ng-template txKanbanCard let-task let-column="column">
        <span class="card">{{ task.title }} · {{ column.id }}</span>
      </ng-template>
      <ng-template txKanbanColumnTop let-column
        ><span class="top">{{ column.title }} top</span></ng-template
      >
      <ng-template txKanbanEmpty let-column
        ><span class="own-empty">Nothing in {{ column.title }}</span></ng-template
      >
      <button type="button" class="add">Add column</button>
    </tx-kanban>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly taskId = (task: Task) => task.id;
  readonly drops: TxKanbanItemDrop[] = [];
  readonly columnDrops: TxKanbanColumnDrop[] = [];
  readonly columns = signal<TxKanbanColumn<Task>[]>([
    {
      id: 'todo',
      title: 'To do',
      items: [
        { id: 'a', title: 'A' },
        { id: 'b', title: 'B' },
        { id: 'c', title: 'C' },
      ],
    },
    { id: 'doing', title: 'Doing', items: [{ id: 'd', title: 'D' }] },
    { id: 'done', title: 'Done', items: [] },
  ]);
}

@Component({
  imports: [TxKanban, TxKanbanCard],
  template: `
    <tx-kanban
      itemsDraggable
      [focusableCards]="false"
      [columns]="columns"
      [itemId]="taskId"
      (itemDropped)="drops.push($event)"
    >
      <ng-template txKanbanCard let-task>
        <button type="button" class="own">{{ task.title }}</button>
        <input class="field" aria-label="Field" />
      </ng-template>
    </tx-kanban>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OwnFocusHost {
  readonly taskId = (task: Task) => task.id;
  readonly drops: TxKanbanItemDrop[] = [];
  readonly columns: TxKanbanColumn<Task>[] = [
    {
      id: 'todo',
      title: 'To do',
      items: [
        { id: 'a', title: 'A' },
        { id: 'b', title: 'B' },
      ],
    },
  ];
}

describe('TxKanban', () => {
  it('renders columns, headers with counts, cards, slots and pages', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-kanban') as HTMLElement;
    expect(root.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Board');
    const columns = Array.from(root.querySelectorAll<HTMLElement>('.tx-kanban__column'));
    expect(columns.map((column) => column.getAttribute('aria-label'))).toEqual([
      'To do',
      'Doing',
      'Done',
    ]);
    expect(columns[0].querySelector('tx-pill')?.textContent?.trim()).toBe('3');
    expect(columns[0].querySelector('.top')?.textContent?.trim()).toBe('To do top');
    expect(
      Array.from(columns[0].querySelectorAll('.card')).map((card) => card.textContent?.trim()),
    ).toEqual(['A · todo', 'B · todo']);
    expect(columns[2].querySelector('.own-empty')?.textContent?.trim()).toBe('Nothing in Done');
    expect(root.querySelector('.tx-kanban__after .add')).not.toBeNull();

    const more = columns[0].querySelector('.tx-kanban__more') as HTMLButtonElement;
    expect(more.textContent?.trim()).toBe('Show 1 more');
    more.click();
    await fixture.whenStable();
    expect(columns[0].querySelectorAll('.card')).toHaveLength(3);
    expect(columns[0].querySelector('.tx-kanban__more')).toBeNull();
    expect(document.activeElement?.getAttribute('data-kanban-card')).toBe('c');
  });

  it('moves cards and columns with Alt and the arrow keys', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-kanban') as HTMLElement;
    const card = (id: string) => root.querySelector(`[data-kanban-card="${id}"]`) as HTMLElement;
    const press = (element: HTMLElement, key: string) =>
      element.dispatchEvent(new KeyboardEvent('keydown', { key, altKey: true, bubbles: true }));
    expect(card('a').getAttribute('tabindex')).toBe('0');
    expect(card('a').getAttribute('aria-description')).toBe('Alt and the arrow keys move it');

    press(card('a'), 'ArrowDown');
    press(card('b'), 'ArrowRight');
    press(card('a'), 'ArrowLeft');
    press(card('a'), 'ArrowUp');
    const handle = root.querySelector('[data-kanban-handle="doing"]') as HTMLElement;
    expect(handle.getAttribute('aria-label')).toBe('Drag to move the column: Doing');
    press(handle, 'ArrowRight');
    expect(fixture.componentInstance.drops).toEqual([
      { itemId: 'a', fromColumnId: 'todo', toColumnId: 'todo', beforeId: null, afterId: 'b' },
      { itemId: 'b', fromColumnId: 'todo', toColumnId: 'doing', beforeId: null, afterId: 'd' },
    ]);
    expect(fixture.componentInstance.columnDrops).toEqual([
      { columnId: 'doing', beforeId: null, afterId: 'done' },
    ]);
  });

  it('leaves the focus to the card template when focusableCards is off', async () => {
    const fixture = TestBed.createComponent(OwnFocusHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-kanban') as HTMLElement;
    const wrapper = root.querySelector('[data-kanban-card="a"]') as HTMLElement;
    expect(wrapper.hasAttribute('tabindex')).toBe(false);
    expect(wrapper.hasAttribute('aria-description')).toBe(false);
    const press = (element: HTMLElement) =>
      element.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
      );
    press(wrapper.querySelector('.field') as HTMLElement);
    expect(fixture.componentInstance.drops).toEqual([]);
    press(wrapper.querySelector('.own') as HTMLElement);
    expect(fixture.componentInstance.drops).toEqual([
      { itemId: 'a', fromColumnId: 'todo', toColumnId: 'todo', beforeId: null, afterId: 'b' },
    ]);
  });
});

@Component({
  imports: [TxKanban, TxKanbanCard, TxKanbanColumnHeader, TxKanbanColumnFooter],
  template: `
    <tx-kanban
      itemsDraggable
      [columnsDraggable]="columnsDraggable()"
      [focusableCards]="focusableCards()"
      [columns]="columns()"
      [itemId]="taskId"
      [pageSize]="pageSize()"
      [height]="height()"
      [columnWidth]="columnWidth()"
      [emptyText]="emptyText()"
      (itemDropped)="drops.push($event)"
      (columnDropped)="columnDrops.push($event)"
    >
      <ng-template txKanbanCard let-task>
        <span class="card" tabindex="0">{{ task.title }}</span>
      </ng-template>
      <ng-template txKanbanColumnHeader let-column
        ><strong class="own-head">{{ column.title }}!</strong></ng-template
      >
      <ng-template txKanbanColumnFooter let-column
        ><span class="own-foot">{{ column.items.length }} in {{ column.id }}</span></ng-template
      >
    </tx-kanban>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SlotsHost {
  readonly taskId = (task: Task) => task.id;
  readonly drops: TxKanbanItemDrop[] = [];
  readonly columnDrops: TxKanbanColumnDrop[] = [];
  readonly columnsDraggable = signal(true);
  readonly focusableCards = signal(true);
  readonly pageSize = signal(30);
  readonly height = signal<string | undefined>(undefined);
  readonly columnWidth = signal<string | undefined>(undefined);
  readonly emptyText = signal<string | undefined>(undefined);
  readonly columns = signal<TxKanbanColumn<Task>[]>([
    {
      id: 'todo',
      title: 'To do',
      items: [
        { id: 'a', title: 'A' },
        { id: 'b', title: 'B' },
        { id: 'c', title: 'C' },
      ],
    },
    { id: 'doing', title: 'Doing', items: [{ id: 'd', title: 'D' }] },
    { id: 'done', title: 'Done', items: [] },
  ]);
}

function pointer(type: string, init: { button?: number; clientX?: number; pointerId?: number; pointerType?: string }): Event {
  const event = new MouseEvent(type, { bubbles: true, button: init.button ?? 0, clientX: init.clientX ?? 0 });
  Object.assign(event, { pointerId: init.pointerId ?? 1, pointerType: init.pointerType ?? 'mouse' });
  return event;
}

function dropLists(fixture: ComponentFixture<SlotsHost>): CdkDropList[] {
  return fixture.debugElement
    .queryAll(By.directive(CdkDropList))
    .map((debug) => debug.injector.get(CdkDropList));
}

function dropEvent<D>(
  container: CdkDropList<D>,
  previousContainer: CdkDropList<D>,
  data: unknown,
  previousIndex: number,
  currentIndex: number,
): CdkDragDrop<D> {
  return {
    container,
    previousContainer,
    item: { data },
    previousIndex,
    currentIndex,
  } as unknown as CdkDragDrop<D>;
}

describe('TxKanban slots, drops and scrolling', () => {
  it('guards the template contexts of every slot directive', () => {
    const context = { $implicit: { id: 'x', title: 'X', items: [] } };
    expect(TxKanbanCard.ngTemplateContextGuard({} as TxKanbanCard<Task>, context)).toBe(true);
    expect(
      TxKanbanColumnHeader.ngTemplateContextGuard({} as TxKanbanColumnHeader<Task>, context),
    ).toBe(true);
    expect(TxKanbanColumnTop.ngTemplateContextGuard({} as TxKanbanColumnTop<Task>, context)).toBe(
      true,
    );
    expect(
      TxKanbanColumnFooter.ngTemplateContextGuard({} as TxKanbanColumnFooter<Task>, null),
    ).toBe(false);
    expect(TxKanbanEmpty.ngTemplateContextGuard({} as TxKanbanEmpty<Task>, undefined)).toBe(false);
  });

  it('renders own headers, footers, the empty text, sizes and every card without paging', async () => {
    const fixture = TestBed.createComponent(SlotsHost);
    fixture.componentInstance.pageSize.set(0);
    fixture.componentInstance.height.set('420px');
    fixture.componentInstance.columnWidth.set('18rem');
    fixture.componentInstance.emptyText.set('Drop here');
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-kanban') as HTMLElement;
    expect(root.classList).toContain('tx-kanban--fixed');
    expect(root.querySelector<HTMLElement>('.tx-kanban__track')?.style.height).toBe('420px');
    const columns = Array.from(root.querySelectorAll<HTMLElement>('.tx-kanban__column'));
    expect(columns[0].style.width).toBe('18rem');
    expect(columns.map((column) => column.querySelector('.own-head')?.textContent)).toEqual([
      'To do!',
      'Doing!',
      'Done!',
    ]);
    expect(root.querySelector('.tx-kanban__title')).toBeNull();
    expect(columns[0].querySelector('.own-foot')?.textContent).toBe('3 in todo');
    expect(columns[0].querySelectorAll('.card')).toHaveLength(3);
    expect(root.querySelector('.tx-kanban__more')).toBeNull();
    expect(columns[2].querySelector('.tx-kanban__empty')?.textContent?.trim()).toBe('Drop here');
    expect(columns[2].querySelector('.tx-kanban__list')?.hasAttribute('role')).toBe(false);
    expect(columns[0].querySelector('.tx-kanban__list')?.getAttribute('tabindex')).toBe('0');
  });

  it('emits item drops from the drop lists and skips drops in place', async () => {
    const fixture = TestBed.createComponent(SlotsHost);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const [, todo, doing] = dropLists(fixture);
    const todoView = todo.data;
    const doingView = doing.data;
    todo.dropped.emit(dropEvent(todo, todo, todoView.items[0], 0, 0));
    expect(host.drops).toEqual([]);

    todo.dropped.emit(dropEvent(todo, todo, todoView.items[0], 0, 1));
    doing.dropped.emit(dropEvent(doing, todo, todoView.items[2], 2, 0));
    todo.dropped.emit(dropEvent(todo, doing, doingView.items[0], 0, 3));
    expect(host.drops).toEqual([
      { itemId: 'a', fromColumnId: 'todo', toColumnId: 'todo', beforeId: 'c', afterId: 'b' },
      { itemId: 'c', fromColumnId: 'todo', toColumnId: 'doing', beforeId: 'd', afterId: null },
      { itemId: 'd', fromColumnId: 'doing', toColumnId: 'todo', beforeId: null, afterId: 'c' },
    ]);
  });

  it('emits column drops from the track and skips drops in place', async () => {
    const fixture = TestBed.createComponent(SlotsHost);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const [track] = dropLists(fixture);
    const columns = host.columns();
    track.dropped.emit(dropEvent(track, track, columns[1], 1, 1));
    expect(host.columnDrops).toEqual([]);
    track.dropped.emit(dropEvent(track, track, columns[2], 2, 0));
    expect(host.columnDrops).toEqual([{ columnId: 'done', beforeId: 'todo', afterId: null }]);
  });

  it('moves columns with the handle keys and refocuses the moved handle', async () => {
    const fixture = TestBed.createComponent(SlotsHost);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const root = fixture.nativeElement.querySelector('tx-kanban') as HTMLElement;
    const handle = (id: string) =>
      root.querySelector(`[data-kanban-handle="${id}"]`) as HTMLButtonElement;
    const press = (element: HTMLElement, key: string, altKey = true) =>
      element.dispatchEvent(new KeyboardEvent('keydown', { key, altKey, bubbles: true }));
    press(handle('todo'), 'ArrowRight', false);
    press(handle('todo'), 'ArrowDown');
    press(handle('todo'), 'ArrowLeft');
    press(handle('done'), 'ArrowRight');
    expect(host.columnDrops).toEqual([]);

    press(handle('doing'), 'ArrowLeft');
    expect(host.columnDrops).toEqual([{ columnId: 'doing', beforeId: 'todo', afterId: null }]);
    await fixture.whenStable();
    expect(document.activeElement).toBe(handle('doing'));
  });

  it('ignores card keys that do not move and focuses the own focusable after a move', async () => {
    const fixture = TestBed.createComponent(SlotsHost);
    fixture.componentInstance.focusableCards.set(false);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const root = fixture.nativeElement.querySelector('tx-kanban') as HTMLElement;
    const card = (id: string) => root.querySelector(`[data-kanban-card="${id}"]`) as HTMLElement;
    const press = (element: HTMLElement, key: string, altKey = true) =>
      element.dispatchEvent(new KeyboardEvent('keydown', { key, altKey, bubbles: true }));
    press(card('a'), 'ArrowUp');
    press(card('a'), 'ArrowLeft');
    press(card('a'), 'ArrowDown', false);
    press(card('a'), 'Enter');
    press(card('d'), 'ArrowRight');
    expect(host.drops).toEqual([
      { itemId: 'd', fromColumnId: 'doing', toColumnId: 'done', beforeId: null, afterId: null },
    ]);
    press(card('c'), 'ArrowDown');
    expect(host.drops).toHaveLength(1);

    press(card('b'), 'ArrowUp');
    await fixture.whenStable();
    expect(document.activeElement).toBe(card('b').querySelector('.card'));
  });

  it('reveals the next card in a scrolling list with the reduced motion setting', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ matches: true, media: query })) as unknown as typeof window.matchMedia;
    try {
      const fixture = TestBed.createComponent(SlotsHost);
      fixture.componentInstance.pageSize.set(2);
      fixture.componentInstance.focusableCards.set(false);
      await fixture.whenStable();
      const root = fixture.nativeElement.querySelector('tx-kanban') as HTMLElement;
      const list = root.querySelector('.tx-kanban__list') as HTMLElement;
      Object.defineProperty(list, 'scrollHeight', { configurable: true, value: 500 });
      Object.defineProperty(list, 'clientHeight', { configurable: true, value: 100 });
      list.style.paddingTop = '8px';
      const scrollTo = vi.fn();
      list.scrollTo = scrollTo as unknown as typeof list.scrollTo;
      (root.querySelector('.tx-kanban__more') as HTMLButtonElement).click();
      await fixture.whenStable();
      expect(scrollTo).toHaveBeenCalledWith({ top: -8, behavior: 'auto' });
      expect(document.activeElement?.textContent).toBe('C');
    } finally {
      window.matchMedia = original;
    }
  });

  it('does nothing when more cards are asked for an unknown column', async () => {
    const fixture = TestBed.createComponent(SlotsHost);
    fixture.componentInstance.pageSize.set(2);
    await fixture.whenStable();
    const kanban = fixture.debugElement.query(By.directive(TxKanban))
      .componentInstance as TxKanban<Task>;
    const active = document.activeElement;
    kanban.showMore('missing');
    await fixture.whenStable();
    expect(document.activeElement).toBe(active);
    expect(fixture.nativeElement.querySelectorAll('.card')).toHaveLength(3);
  });

  it('scrolls the board sideways while a mouse drags its background', async () => {
    const fixture = TestBed.createComponent(SlotsHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-kanban') as HTMLElement;
    const board = root.querySelector('.tx-kanban__board') as HTMLElement;
    const track = root.querySelector('.tx-kanban__track') as HTMLElement;
    const capture = vi.fn();
    board.setPointerCapture = capture;
    board.scrollLeft = 100;

    board.dispatchEvent(pointer('pointermove', { clientX: 10 }));
    expect(board.scrollLeft).toBe(100);
    track.dispatchEvent(pointer('pointerdown', { button: 2, clientX: 50 }));
    track.dispatchEvent(pointer('pointerdown', { pointerType: 'touch', clientX: 50 }));
    root.querySelector('.card')?.dispatchEvent(pointer('pointerdown', { clientX: 50 }));
    expect(capture).not.toHaveBeenCalled();

    track.dispatchEvent(pointer('pointerdown', { clientX: 50, pointerId: 7 }));
    expect(capture).toHaveBeenCalledWith(7);
    board.dispatchEvent(pointer('pointermove', { clientX: 20, pointerId: 8 }));
    expect(board.scrollLeft).toBe(100);
    board.dispatchEvent(pointer('pointermove', { clientX: 20, pointerId: 7 }));
    expect(board.scrollLeft).toBe(130);
    board.dispatchEvent(pointer('pointerup', { pointerId: 7 }));
    board.dispatchEvent(pointer('pointermove', { clientX: 0, pointerId: 7 }));
    expect(board.scrollLeft).toBe(130);
    board.dispatchEvent(pointer('pointerdown', { clientX: 0, pointerId: 9 }));
    board.dispatchEvent(pointer('pointercancel', { pointerId: 9 }));
    board.dispatchEvent(pointer('pointermove', { clientX: 40, pointerId: 9 }));
    expect(board.scrollLeft).toBe(130);
  });
});
