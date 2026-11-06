import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTable } from './table.component';
import { csvCell, toCsv } from './table.export';
import { TxTableColumn, TxTableLazyLoadEvent } from './table.types';

interface Row {
  id: number;
  name: string;
  note: string;
}

const ROWS: Row[] = Array.from({ length: 200 }, (_, index) => ({ id: index + 1, name: `Row ${index + 1}`, note: index === 0 ? '=SUM(A1)' : 'plain, text' }));

@Component({
  imports: [TxTable],
  template: `
    <tx-table
      ariaLabel="Rows"
      dataKey="id"
      scrollHeight="400px"
      selectionMode="multiple"
      [value]="rows()"
      [columns]="columns"
      [virtualScroll]="true"
      [virtualScrollTolerance]="2"
      [lazy]="lazy()"
      [lazyLoadOnInit]="false"
      [cellTooltip]="true"
      [(selection)]="selected"
      (lazyLoad)="loads.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly rows = signal<(Row | undefined)[]>(ROWS);
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Name' },
    { field: 'note', header: 'Note' },
  ];
  readonly lazy = signal(false);
  readonly selected = signal<Row | Row[] | null>([]);
  readonly loads: TxTableLazyLoadEvent[] = [];
}

describe('table csv', () => {
  it('quotes cells and guards formulas', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('=1+1')).toBe("'=1+1");
    expect(csvCell('-12.5')).toBe('-12.5');
    expect(csvCell('-')).toBe('-');
    expect(toCsv([{ a: 1, b: { c: 'x' } }], [{ field: 'a', header: 'A' }, { field: 'b.c', header: 'C' }])).toBe('A,C\r\n1,x');
  });
});

describe('TxTable virtual scroll and export', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const rendered = () => [...root().querySelectorAll('.tx-table__tbody > .tx-table__row')];
  const scroller = () => root().querySelector('.tx-table__scroller') as HTMLElement;
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };
  const scrollTo = async (top: number) => {
    Object.defineProperty(scroller(), 'clientHeight', { configurable: true, value: 400 });
    scroller().scrollTop = top;
    scroller().dispatchEvent(new Event('scroll'));
    await stable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await stable();
    await scrollTo(0);
  });

  afterEach(() => fixture.destroy());

  it('renders only the rows in view with spacers around them', async () => {
    expect(rendered().length).toBe(10);
    await scrollTo(5000);
    const names = rendered().map((row) => row.querySelector('[data-field="name"]')?.textContent?.trim());
    expect(names[0]).toBe('Row 99');
    expect(names.at(-1)).toBe('Row 110');
    const spacers = [...root().querySelectorAll<HTMLElement>('.tx-table__spacer td')].map((cell) => cell.style.height);
    expect(spacers).toEqual(['4900px', '4500px']);
  });

  it('asks the server for the visible range in lazy mode and shows skeletons meanwhile', async () => {
    host.lazy.set(true);
    host.rows.set(Array.from({ length: 200 }, (_, index) => (index < 20 ? ROWS[index] : undefined)));
    await stable();
    await scrollTo(3000);
    expect(root().querySelector('.tx-table__loading-cell')).toBeTruthy();
    expect(host.loads.at(-1)).toMatchObject({ first: 58, rows: 12 });
  });

  it('moves the keyboard focus past the rendered window', async () => {
    const first = rendered()[0] as HTMLElement;
    first.click();
    await stable();
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable;
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await stable();
    expect(table.focusedRow()).toBe(199);
    expect((document.activeElement as HTMLElement).dataset['key']).toBe('200');
  });

  it('exports the rows as csv with a cell tooltip on cut text', async () => {
    expect(root().querySelector('.tx-table__cell-text')).toBeTruthy();
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable;
    const csv = table.exportCSV();
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Name,Note');
    expect(lines[1]).toBe("Row 1,'=SUM(A1)");
    expect(lines[2]).toBe('Row 2,"plain, text"');
    expect(lines).toHaveLength(201);
    host.selected.set([ROWS[4]]);
    await stable();
    expect(table.exportCSV({ selectionOnly: true }).split('\r\n')).toEqual(['Name,Note', 'Row 5,"plain, text"']);
  });
});
