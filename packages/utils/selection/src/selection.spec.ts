import { TxSelection } from './selection';

interface Row {
  id: string;
  paid: boolean;
}

const rows: Row[] = [
  { id: 'a', paid: true },
  { id: 'b', paid: false },
  { id: 'c', paid: true },
];

describe('TxSelection', () => {
  it('selects one, many and all with the original API', () => {
    const selection = new TxSelection<Row>((row) => row.id);
    selection.toggleOne('a', true);
    selection.toggleOne(rows[1], true);
    expect(selection.count()).toBe(2);
    expect(selection.isSelected(rows[0])).toBe(true);
    expect(selection.isPartial(rows)).toBe(true);
    selection.select((row) => row.paid, rows, true);
    expect(selection.areAllSelected(rows)).toBe(true);
    selection.select((row) => row.paid, rows, false);
    expect(selection.selectedItems(rows)).toEqual([rows[1]]);
    expect(selection.areAllSelectedWithPredicate(rows, (row) => !row.paid)).toBe(true);
  });

  it('toggles everything for a header checkbox', () => {
    const selection = new TxSelection<Row>((row) => row.id);
    selection.toggleAll(rows);
    expect(selection.count()).toBe(3);
    selection.toggleAll(rows);
    expect(selection.count()).toBe(0);
    selection.toggleOne('b');
    expect(selection.isSelected('b')).toBe(true);
    selection.setSelected(['a', 'c']);
    expect([...selection.selectedIds()]).toEqual(['a', 'c']);
    selection.clear();
    expect(selection.areAllSelected([])).toBe(false);
  });
});
