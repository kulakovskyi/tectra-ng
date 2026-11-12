import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTableActions } from './table-actions.component';
import { TxTableActionsStore } from './table-actions.store';
import { TxTable } from './table.component';
import { TxTableAction, TxTableActionsTemplate } from './table.templates';
import { TxTableColumn } from './table.types';

describe('TxTableActionsStore', () => {
  let store: TxTableActionsStore;
  let changes: number;

  beforeEach(() => {
    store = TestBed.runInInjectionContext(() => new TxTableActionsStore());
    changes = 0;
    store.onChange(() => changes++);
  });

  it('pins without a change listener', () => {
    const own = TestBed.runInInjectionContext(() => new TxTableActionsStore());
    own.setPinned('edit', true);
    expect(own.isPinned('edit')).toBe(true);
  });

  it('sizes the actions column before and after actions register', () => {
    expect(store.columnWidth()).toBe('90px');
    store.inlineCount.set(2);
    expect(store.columnWidth()).toBe('128.5px');
    store.register([
      { id: 'edit', label: 'Edit' },
      { id: 'copy', label: 'Copy' },
      { id: 'delete', label: 'Delete' },
    ]);
    expect([...store.pinnedIds()]).toEqual(['edit', 'copy']);
    expect(store.columnWidth()).toBe('128.5px');
    store.inlineCount.set(1);
    expect(store.columnWidth()).toBe('91.5px');
  });

  it('merges new labels and new actions without duplicates', () => {
    store.register([{ id: 'edit', label: 'Edit' }]);
    const first = store.registeredActions();
    store.register([{ id: 'edit', label: 'Edit' }]);
    expect(store.registeredActions()).toBe(first);
    store.register([
      { id: 'edit', label: 'Change' },
      { id: 'delete', label: 'Delete' },
    ]);
    expect(store.registeredActions()).toEqual([
      { id: 'edit', label: 'Change' },
      { id: 'delete', label: 'Delete' },
    ]);
  });

  it('restores, pins and reorders actions and reports each change', () => {
    store.register([
      { id: 'edit', label: 'Edit' },
      { id: 'copy', label: 'Copy' },
      { id: 'delete', label: 'Delete' },
    ]);
    store.restore(['delete', 'gone', 'edit'], ['copy']);
    expect(store.registeredActions().map((item) => item.id)).toEqual(['delete', 'edit', 'copy']);
    expect(store.isPinned('copy')).toBe(true);
    expect(store.isPinned('edit')).toBe(false);
    store.setPinned('edit', true);
    store.setPinned('copy', false);
    expect([...store.pinnedIds()]).toEqual(['edit']);
    store.reorder(0, 2);
    expect(store.registeredActions().map((item) => item.id)).toEqual(['edit', 'copy', 'delete']);
    expect(changes).toBe(3);
    store.restore(undefined, undefined);
    expect(store.order()).toEqual([]);
    expect(store.pinned()).toBeNull();
  });
});

@Component({
  imports: [TxTableActions, TxTableAction],
  template: `
    <tx-table-actions [inlineCount]="inline()">
      <button *txTableAction="{ label: 'Edit' }" class="edit" type="button">Edit</button>
      <button *txTableAction="{ label: 'Copy' }" class="copy" type="button">Copy</button>
      <button *txTableAction="{ label: 'Delete' }" class="delete" type="button">Delete</button>
    </tx-table-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StandaloneHost {
  readonly inline = signal<number | undefined>(1);
}

describe('TxTableActions outside a table', () => {
  let fixture: ComponentFixture<StandaloneHost>;
  const inline = () => [...fixture.nativeElement.querySelectorAll('tx-table-actions > button:not(.tx-table-actions__more)')].map((button) => button.textContent);

  beforeEach(async () => {
    fixture = TestBed.createComponent(StandaloneHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  it('shows the first actions inline and the rest behind the more button', async () => {
    expect(inline()).toEqual(['Edit']);
    expect(fixture.nativeElement.querySelector('.tx-table-actions__more')).toBeTruthy();
    fixture.componentInstance.inline.set(undefined);
    await fixture.whenStable();
    expect(inline()).toEqual([]);
    fixture.componentInstance.inline.set(3);
    await fixture.whenStable();
    expect(inline()).toEqual(['Edit', 'Copy', 'Delete']);
    expect(fixture.nativeElement.querySelector('.tx-table-actions__more')).toBeNull();
  });
});

interface Doc {
  id: number;
  title: string;
}

@Component({
  imports: [TxTable, TxTableActionsTemplate, TxTableActions, TxTableAction],
  template: `
    <tx-table
      ariaLabel="Docs"
      dataKey="id"
      stateKey="docs"
      actionsHeader="Do"
      [value]="docs"
      [columns]="columns"
      [actionsSettings]="true"
      [actionsInlineCount]="1"
      [responsive]="false"
    >
      <ng-template txTableActions>
        <tx-table-actions [inlineCount]="inline()">
          <button *txTableAction="{ label: 'Open' }" class="open" type="button">Open</button>
          <button *txTableAction="{ label: 'Share' }" class="share" type="button">Share</button>
        </tx-table-actions>
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TableHost {
  readonly docs: Doc[] = [{ id: 1, title: 'Plan' }];
  readonly columns: TxTableColumn[] = [{ field: 'title', header: 'Title' }];
  readonly inline = signal<number | undefined>(undefined);
}

describe('TxTableActions in a table', () => {
  let fixture: ComponentFixture<TableHost>;
  let table: TxTable<Doc>;
  const inline = () => [...fixture.nativeElement.querySelectorAll('tbody tx-table-actions > button:not(.tx-table-actions__more)')].map((button) => button.textContent);
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    localStorage.clear();
    fixture = TestBed.createComponent(TableHost);
    fixture.autoDetectChanges();
    await stable();
    table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<Doc>;
  });

  afterEach(() => fixture.destroy());

  it('follows the pinned actions of the table, saves them and skips unknown saved ids', async () => {
    expect(fixture.nativeElement.querySelector('th[data-field="__actions"]').textContent.trim()).toBe('Do');
    expect(inline()).toEqual(['Open']);
    table.actionsStore.setPinned('share', true);
    await stable();
    expect(inline()).toEqual(['Open', 'Share']);
    expect(JSON.parse(localStorage.getItem('docs') ?? '{}').pinnedActions).toEqual(['open', 'share']);
    table.actionsStore.restore(['gone', 'share'], ['share']);
    await stable();
    expect(inline()).toEqual(['Share']);
    expect(fixture.nativeElement.querySelector('tbody .tx-table-actions__more')).toBeTruthy();
  });

  it('uses its own inline count until actions are pinned in the settings', async () => {
    fixture.componentInstance.inline.set(2);
    await stable();
    expect(inline()).toEqual(['Open', 'Share']);
    table.actionsStore.setPinned('share', false);
    await stable();
    expect(inline()).toEqual(['Open']);
  });
});
