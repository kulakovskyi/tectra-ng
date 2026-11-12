import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTableActions } from './table-actions.component';
import { TxTableSettings } from './table-settings.component';
import { TxTable } from './table.component';
import { TxTableAction, TxTableActionsTemplate } from './table.templates';
import { TxTableColumn } from './table.types';

interface Doc {
  id: number;
  title: string;
  owner: string;
  size: number;
  kind: string;
}

@Component({
  imports: [TxTable, TxTableActionsTemplate, TxTableActions, TxTableAction],
  template: `
    <tx-table
      ariaLabel="Docs"
      dataKey="id"
      [value]="docs"
      [(columns)]="columns"
      [columnSettings]="showColumns()"
      [actionsSettings]="showActions()"
      [reorderableColumns]="reorderable()"
      [responsive]="false"
      (columnVisibilityChange)="visibility.push($event)"
    >
      <ng-template txTableActions>
        <tx-table-actions>
          <button *txTableAction="{ label: 'Open' }" type="button">Open</button>
          <button *txTableAction="{ label: 'Share' }" type="button">Share</button>
          <button *txTableAction="{ label: 'Delete' }" type="button">Delete</button>
        </tx-table-actions>
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly docs: Doc[] = [{ id: 1, title: 'Plan', owner: 'Olena', size: 3, kind: 'pdf' }];
  columns: TxTableColumn[] = [
    { field: 'title', header: 'Title', hideable: false },
    { field: 'owner', header: 'Owner' },
    { field: 'size', header: 'Size' },
    { field: 'kind', header: 'Kind', reorderable: false },
  ];
  readonly showColumns = signal(true);
  readonly showActions = signal(true);
  readonly reorderable = signal(true);
  readonly visibility: string[][] = [];
}

describe('TxTableSettings', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let settings: TxTableSettings;
  const panel = () => document.querySelector('.tx-table-settings__panel') as HTMLElement;
  const tabs = () => [...panel().querySelectorAll<HTMLElement>('[role="tab"]')];
  const labels = () => [...panel().querySelectorAll('.tx-table-settings__action tx-checkbox')].map((box) => box.textContent?.trim());
  const boxes = () => [...panel().querySelectorAll<HTMLInputElement>('.tx-table-settings__action input')];
  const keydown = (target: Element, key: string, init: KeyboardEventInit = {}) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };
  const open = async () => {
    (fixture.nativeElement.querySelector('.tx-table-settings__button') as HTMLElement).click();
    await stable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await stable();
    settings = fixture.debugElement.query((node) => node.componentInstance instanceof TxTableSettings).componentInstance as TxTableSettings;
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('switches between the columns and actions tabs with clicks and arrow keys', async () => {
    await open();
    expect(tabs().map((tab) => tab.textContent?.trim())).toEqual(['Columns', 'Actions']);
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(panel().querySelector('.tx-table-settings__list')?.getAttribute('role')).toBe('tabpanel');
    keydown(tabs()[0], 'ArrowRight');
    await stable();
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
    expect(labels()).toEqual(['Open', 'Share', 'Delete']);
    keydown(tabs()[1], 'ArrowLeft');
    await stable();
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    tabs()[1].click();
    await stable();
    expect(tabs()[1].getAttribute('tabindex')).toBe('0');
  });

  it('hides columns and keeps the columns that cannot be hidden', async () => {
    await open();
    expect(labels()).toEqual(['Title', 'Owner', 'Size', 'Kind']);
    expect(boxes()[0].disabled).toBe(true);
    expect(panel().querySelectorAll('.tx-table-settings__handle--hidden')).toHaveLength(1);
    boxes()[1].click();
    await stable();
    expect(host.visibility).toEqual([['owner']]);
    expect(fixture.nativeElement.querySelector('th[data-field="owner"]')).toBeNull();
  });

  it('moves columns with Alt and the arrow keys and skips fixed ones', async () => {
    await open();
    const owner = () => panel().querySelectorAll('.tx-table-settings__action tx-checkbox')[1];
    keydown(owner(), 'ArrowDown', { altKey: true });
    await stable();
    expect(host.columns.map((column) => column.field)).toEqual(['title', 'size', 'owner', 'kind']);
    expect(document.activeElement).toBe(boxes()[2]);
    keydown(panel().querySelectorAll('.tx-table-settings__action tx-checkbox')[2], 'ArrowDown', { altKey: true });
    keydown(panel().querySelectorAll('.tx-table-settings__action tx-checkbox')[3], 'ArrowUp', { altKey: true });
    keydown(panel().querySelectorAll('.tx-table-settings__action tx-checkbox')[0], 'ArrowUp', { altKey: true });
    await stable();
    expect(host.columns.map((column) => column.field)).toEqual(['title', 'size', 'owner', 'kind']);
  });

  it('drops columns on reorderable targets only', async () => {
    settings.dropColumn({ previousIndex: 1, currentIndex: 2 } as never);
    await stable();
    expect(host.columns.map((column) => column.field)).toEqual(['title', 'size', 'owner', 'kind']);
    settings.dropColumn({ previousIndex: 1, currentIndex: 3 } as never);
    settings.dropColumn({ previousIndex: 1, currentIndex: 9 } as never);
    await stable();
    expect(host.columns.map((column) => column.field)).toEqual(['title', 'size', 'owner', 'kind']);
  });

  it('pins and reorders actions from the actions tab', async () => {
    await open();
    tabs()[1].click();
    await stable();
    boxes()[1].click();
    await stable();
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<Doc>;
    expect(table.actionsStore.isPinned('share')).toBe(true);
    const actionBoxes = () => panel().querySelectorAll('.tx-table-settings__action tx-checkbox');
    keydown(actionBoxes()[0], 'ArrowDown', { altKey: true });
    await stable();
    expect(labels()).toEqual(['Share', 'Open', 'Delete']);
    expect(document.activeElement).toBe(boxes()[1]);
    keydown(actionBoxes()[0], 'ArrowUp', { altKey: true });
    keydown(actionBoxes()[2], 'ArrowDown', { altKey: true });
    await stable();
    expect(labels()).toEqual(['Share', 'Open', 'Delete']);
    settings.dropAction({ previousIndex: 2, currentIndex: 0 } as never);
    await stable();
    expect(labels()).toEqual(['Delete', 'Share', 'Open']);
  });

  it('shows a single title when only one list is on and lists hideable columns without reordering', async () => {
    host.showActions.set(false);
    host.reorderable.set(false);
    await stable();
    await open();
    expect(tabs()).toHaveLength(0);
    expect(panel().querySelector('.tx-table-settings__title')?.textContent?.trim()).toBe('Columns');
    expect(panel().querySelector('.tx-table-settings__list')?.getAttribute('role')).toBe('group');
    expect(labels()).toEqual(['Owner', 'Size', 'Kind']);
    expect(panel().querySelector('.tx-table-settings__handle')).toBeNull();
    keydown(panel().querySelectorAll('.tx-table-settings__action tx-checkbox')[0], 'ArrowDown', { altKey: true });
    await stable();
    expect(host.columns.map((column) => column.field)).toEqual(['title', 'owner', 'size', 'kind']);
  });

  it('opens on the actions list when columns are off', async () => {
    host.showColumns.set(false);
    await stable();
    await open();
    expect(panel().querySelector('.tx-table-settings__title')?.textContent?.trim()).toBe('Actions');
    expect(labels()).toEqual(['Open', 'Share', 'Delete']);
  });
});
