import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { TxTable } from './table.component';
import { TxTableEditor } from './table.templates';
import { TxTableCellEditEvent, TxTableColumn, TxTableEditMode, TxTableRowEditEvent } from './table.types';

interface Product {
  id: number;
  name: string;
  stock: number;
  note: string;
  received: Date;
}

@Component({
  imports: [TxTable, TxTableEditor],
  template: `
    <tx-table
      ariaLabel="Products"
      dataKey="id"
      [value]="products"
      [columns]="columns"
      [editMode]="mode()"
      [(editingRowKeys)]="editing"
      (cellEditInit)="inits.push($event)"
      (cellEditComplete)="completes.push($event)"
      (cellEditCancel)="cancels.push($event)"
      (rowEditSave)="saves.push($event)"
      (rowEditCancel)="rowCancels.push($event)"
    >
      <ng-template txTableEditor="note" let-value="value" let-set="set" let-commit="commit">
        <textarea class="own-editor" aria-label="Note" [value]="value" (input)="set($any($event.target).value)" (blur)="commit()"></textarea>
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly products: Product[] = [
    { id: 1, name: 'Desk', stock: 4, note: 'oak', received: new Date(2026, 0, 5) },
    { id: 2, name: 'Stool', stock: 12, note: 'pine', received: new Date(2026, 1, 9) },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Name', editable: true },
    { field: 'stock', header: 'Stock', editable: true, editType: 'numeric' },
    { field: 'note', header: 'Note', editable: true },
    { field: 'received', header: 'Received', editable: true, editType: 'date' },
  ];
  readonly mode = signal<TxTableEditMode>('cell');
  readonly editing = signal<unknown[]>([]);
  readonly inits: TxTableCellEditEvent[] = [];
  readonly completes: TxTableCellEditEvent[] = [];
  readonly cancels: TxTableCellEditEvent[] = [];
  readonly saves: TxTableRowEditEvent[] = [];
  readonly rowCancels: TxTableRowEditEvent[] = [];
}

describe('TxTable editing', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const cell = (row: number, field: string) => root().querySelectorAll<HTMLElement>('tbody .tx-table__row')[row].querySelector(`[data-field="${field}"]`) as HTMLElement;
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };
  const key = (target: Element, name: string, shiftKey = false) => target.dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await stable();
  });

  afterEach(() => fixture.destroy());

  it('edits a cell on click and saves with Enter', async () => {
    expect(cell(0, 'name').getAttribute('tabindex')).toBe('0');
    cell(0, 'name').click();
    await stable();
    const input = cell(0, 'name').querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Desk');
    expect(document.activeElement).toBe(input);
    input.value = 'Standing desk';
    input.dispatchEvent(new Event('input'));
    key(input, 'Enter');
    await stable();
    expect(cell(0, 'name').textContent?.trim()).toBe('Standing desk');
    expect(host.products[0].name).toBe('Standing desk');
    expect(host.completes[0]).toMatchObject({ field: 'name', value: 'Standing desk', previousValue: 'Desk', index: 0 });
    expect(host.inits).toHaveLength(1);
  });

  it('cancels with Escape and moves to the next editable cell with Tab', async () => {
    key(cell(1, 'name'), 'F2');
    await stable();
    const input = cell(1, 'name').querySelector('input') as HTMLInputElement;
    input.value = 'Changed';
    input.dispatchEvent(new Event('input'));
    key(input, 'Escape');
    await stable();
    expect(host.products[1].name).toBe('Stool');
    expect(host.cancels).toHaveLength(1);

    key(cell(1, 'name'), 'Enter');
    await stable();
    key(cell(1, 'name').querySelector('input') as HTMLInputElement, 'Tab');
    await stable();
    expect(cell(1, 'stock').querySelector('tx-input-number')).toBeTruthy();
    expect(cell(1, 'name').querySelector('input')).toBeNull();
  });

  it('uses an own editor template', async () => {
    cell(0, 'note').click();
    await stable();
    const area = cell(0, 'note').querySelector('.own-editor') as HTMLTextAreaElement;
    area.value = 'walnut';
    area.dispatchEvent(new Event('input'));
    area.dispatchEvent(new Event('blur'));
    await stable();
    expect(host.products[0].note).toBe('walnut');
  });

  it('edits a date cell with the date picker and saves with Enter', async () => {
    cell(0, 'received').click();
    await stable();
    expect(cell(0, 'received').querySelector('tx-datepicker')).toBeTruthy();
    const input = cell(0, 'received').querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('01/05/2026');
    input.value = '03/15/2026';
    input.dispatchEvent(new Event('input'));
    key(input, 'Enter');
    await stable();
    expect(host.products[0].received).toEqual(new Date(2026, 2, 15));
    expect(host.completes[0]).toMatchObject({ field: 'received', previousValue: new Date(2026, 0, 5) });
  });

  it('edits a whole row with the row editor buttons', async () => {
    host.mode.set('row');
    await stable();
    const editButton = root().querySelector<HTMLElement>('tbody .tx-table__row [aria-label="Edit row"]') as HTMLElement;
    editButton.click();
    await stable();
    expect(host.editing()).toEqual([1]);
    expect(root().querySelectorAll('tbody .tx-table__row')[0].querySelectorAll('.tx-table__editor')).toHaveLength(4);
    const name = cell(0, 'name').querySelector('input') as HTMLInputElement;
    name.value = 'Desk XL';
    name.dispatchEvent(new Event('input'));
    (root().querySelector('[aria-label="Save row"]') as HTMLElement).click();
    await stable();
    expect(host.products[0].name).toBe('Desk XL');
    expect(host.saves[0]).toMatchObject({ changes: { name: 'Desk XL' }, previous: { name: 'Desk', stock: 4, note: 'oak' } });
    expect(host.editing()).toEqual([]);

    host.editing.set([2]);
    await stable();
    const stool = cell(1, 'name').querySelector('input') as HTMLInputElement;
    stool.value = 'Bar stool';
    stool.dispatchEvent(new Event('input'));
    (root().querySelector('[aria-label="Cancel editing"]') as HTMLElement).click();
    await stable();
    expect(host.products[1].name).toBe('Stool');
    expect(host.rowCancels).toHaveLength(1);
  });
});

describe('TxTable editors that load on first use', () => {
  it('shows the cell value in a read-only stand-in and focuses the editor once it has loaded', async () => {
    TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const stock = () => fixture.nativeElement.querySelectorAll('tbody .tx-table__row')[0].querySelector('[data-field="stock"]') as HTMLElement;

    stock().click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    const standIn = stock().querySelector<HTMLInputElement>('input.tx-table__editor-pending');
    expect(standIn?.value).toBe('4');
    expect(standIn?.readOnly).toBe(true);
    expect(document.activeElement).not.toBe(standIn);

    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(stock().querySelector('.tx-table__editor-pending')).toBeNull();
    expect(stock().querySelector('tx-input-number')?.contains(document.activeElement)).toBe(true);
    fixture.destroy();
  });
});
