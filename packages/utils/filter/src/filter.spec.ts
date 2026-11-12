import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxFilterByPipe, TxSearchPipe, filterBy, filterBySearch, matches, normalizeSearch, resolveField } from './filter';

interface Person {
  name: string;
  city: string | null;
  age: number;
  joined: string;
  team: { name: string };
}

const people: Person[] = [
  { name: 'Zoë Novák', city: 'Kyiv', age: 31, joined: '2024-03-01', team: { name: 'Design' } },
  { name: 'Ann Lee', city: null, age: 24, joined: '2025-06-15', team: { name: 'Platform' } },
  { name: 'Mark Ivanenko', city: 'Lviv', age: 45, joined: '2019-11-20', team: { name: 'Sales' } },
];
const names = (list: Person[]) => list.map((person) => person.name);

@Component({
  imports: [TxSearchPipe, TxFilterByPipe],
  template: `
    <span class="search">{{ names(people() | txSearch: 'lviv' : fields) }}</span>
    <span class="by">{{ names(people() | txFilterBy: 40 : ['age'] : 'gt') }}</span>
    <span class="empty">{{ (missing() | txSearch: 'a' : fields).length }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FilterHost {
  readonly people = signal(people);
  readonly missing = signal<Person[] | null>(null);
  readonly fields = ['name', 'city'];
  readonly names = names;
}

describe('filter', () => {
  it('normalizes accents, case and spaces', () => {
    expect(normalizeSearch('  Zoë NOVÁK ')).toBe('zoe novak');
    expect(normalizeSearch(null)).toBe('');
  });

  it('searches several fields with a getter or paths', () => {
    expect(names(filterBySearch(people, 'zoe', (person) => [person.name, person.city]))).toEqual(['Zoë Novák']);
    expect(names(filterBySearch(people, 'plat', ['name', 'team.name']))).toEqual(['Ann Lee']);
    expect(filterBySearch(people, '  ', ['name'])).toHaveLength(3);
    expect(filterBySearch(people, 'kyiv', ['city'])).toHaveLength(1);
  });

  it('filters with match modes of the table', () => {
    expect(names(filterBy(people, 'm', ['name'], 'startsWith'))).toEqual(['Mark Ivanenko']);
    expect(names(filterBy(people, 30, ['age'], 'gt'))).toEqual(['Zoë Novák', 'Mark Ivanenko']);
    expect(names(filterBy(people, [25, 40], ['age'], 'between'))).toEqual(['Zoë Novák']);
    expect(names(filterBy(people, ['Kyiv', 'Lviv'], ['city'], 'in'))).toEqual(['Zoë Novák', 'Mark Ivanenko']);
    expect(names(filterBy(people, '2024-01-01', ['joined'], 'dateBefore'))).toEqual(['Mark Ivanenko']);
    expect(matches('Lviv', 'kyiv', 'notEquals')).toBe(true);
  });

  it('takes an own match function', () => {
    const even = (value: unknown) => Number(value) % 2 === 0;
    expect(names(filterBy(people, null, ['age'], even))).toEqual(['Ann Lee']);
  });

  it('resolves nested fields and works as pipes', () => {
    expect(resolveField(people[0], 'team.name')).toBe('Design');
    expect(names(new TxSearchPipe().transform(people, 'lee', ['name']))).toEqual(['Ann Lee']);
    expect(new TxFilterByPipe().transform(null, 'x', ['name'])).toEqual([]);
  });

  it('filters inside templates and treats a missing list as empty', () => {
    const fixture = TestBed.createComponent(FilterHost);
    fixture.detectChanges();
    const text = (selector: string) => (fixture.nativeElement.querySelector(selector) as HTMLElement).textContent;
    expect(text('.search')).toBe('Mark Ivanenko');
    expect(text('.by')).toBe('Mark Ivanenko');
    expect(text('.empty')).toBe('0');
  });
});
