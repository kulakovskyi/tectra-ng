import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxKanbanCard, TxKanbanColumnTop, TxKanbanEmpty } from './kanban-templates.directive';
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
