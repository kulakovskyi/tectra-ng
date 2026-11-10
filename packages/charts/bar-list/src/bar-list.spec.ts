import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { barListRows } from './bar-list-rows';
import { TxBarList } from './bar-list.component';
import { TxBarListItem } from './bar-list.types';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

@Component({
  imports: [TxBarList],
  template: `
    <tx-bar-list
      id="main"
      [items]="items()"
      [limit]="limit()"
      [loading]="loading()"
      [valueFormat]="format()"
      ariaLabel="Top countries"
      [dt]="{ barList: { rowHeight: '32px' } }"
      [pt]="{ bar: { class: 'own-bar' }, root: { class: 'own-root' } }"
    />
    <tx-bar-list id="plain" [items]="items()" unstyled />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxBarListItem[]>([
    { label: 'Germany', value: 300, link: '/orders', queryParams: { country: 'de' } },
    { label: 'France', value: 0 },
    { label: 'Poland', value: 100 },
    { label: 'Spain', value: 600 },
  ]);
  readonly limit = signal(10);
  readonly loading = signal(false);
  readonly format = signal<'number' | 'compact'>('number');
}

const plain = (value: number) => String(value);

describe('bar list rows', () => {
  it('sorts descending, drops zeros and scales to the biggest value', () => {
    const rows = barListRows(
      [
        { label: 'A', value: 50 },
        { label: 'B', value: 0 },
        { label: 'C', value: 100 },
        { label: 'D', value: -5 },
        { label: 'E', value: 50 },
      ],
      10,
      plain,
    );
    expect(rows.map((row) => row.label)).toEqual(['C', 'A', 'E']);
    expect(rows.map((row) => row.share)).toEqual([100, 50, 50]);
    expect(rows.map((row) => row.percent)).toEqual(['50%', '25%', '25%']);
  });

  it('keeps the share of the whole total when the list is cut', () => {
    const rows = barListRows(
      [
        { label: 'A', value: 2 },
        { label: 'B', value: 1 },
        { label: 'C', value: 1 },
      ],
      1,
      plain,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].percent).toBe('50%');
  });

  it('rounds the percent to one decimal and handles empty input', () => {
    expect(barListRows([{ label: 'A', value: 1 }, { label: 'B', value: 2 }], 10, plain).map((row) => row.percent)).toEqual(['66.7%', '33.3%']);
    expect(barListRows(null, 10, plain)).toEqual([]);
    expect(barListRows([{ label: 'A', value: 1 }], 0, plain)).toEqual([]);
  });
});

describe('TxBarList', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const main = () => fixture.nativeElement.querySelector('#main') as HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'orders', component: Page }])] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders sorted rows with value, percent and bar width', () => {
    const rows = [...main().querySelectorAll('.tx-bar-list__row')];
    expect(rows.map((row) => row.querySelector('.tx-bar-list__label')?.textContent?.trim())).toEqual(['Spain', 'Germany', 'Poland']);
    expect(rows[0].querySelector('.tx-bar-list__value')?.textContent?.trim()).toBe('600');
    expect(rows[0].querySelector('.tx-bar-list__percent')?.textContent?.trim()).toBe('60%');
    expect((rows[1].querySelector('.tx-bar-list__bar') as HTMLElement).style.width).toBe('50%');
    expect(rows[2].querySelector('.tx-bar-list__label')?.getAttribute('title')).toBe('Poland');
    expect(main().querySelector('ul')?.getAttribute('aria-label')).toBe('Top countries');
  });

  it('makes a row with a link a router link with query params', () => {
    const link = main().querySelector('a.tx-bar-list__row--link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/orders?country=de');
    expect(link.textContent).toContain('Germany');
    expect(main().querySelectorAll('a')).toHaveLength(1);
  });

  it('limits the rows and formats values', async () => {
    host.items.set([{ label: 'A', value: 12500 }, { label: 'B', value: 7500 }]);
    host.limit.set(1);
    host.format.set('compact');
    await fixture.whenStable();
    const rows = main().querySelectorAll('.tx-bar-list__row');
    expect(rows).toHaveLength(1);
    expect(rows[0].querySelector('.tx-bar-list__value')?.textContent?.trim()).toBe('12.5K');
    expect(rows[0].querySelector('.tx-bar-list__percent')?.textContent?.trim()).toBe('62.5%');
  });

  it('shows "No data" without positive values and a skeleton while loading', async () => {
    host.items.set([{ label: 'A', value: 0 }]);
    await fixture.whenStable();
    expect(main().querySelector('.tx-bar-list__empty')?.textContent?.trim()).toBe('No data');
    host.loading.set(true);
    await fixture.whenStable();
    expect(main().querySelectorAll('tx-skeleton')).toHaveLength(5);
    expect(main().getAttribute('aria-busy')).toBe('true');
  });

  it('formats numbers in the tectra locale', async () => {
    TestBed.inject(TxLocaleService).setLocale('ua');
    host.items.set([{ label: 'A', value: 1000.5 }, { label: 'B', value: 1000.5 }, { label: 'C', value: 1000.5 }]);
    await fixture.whenStable();
    const row = main().querySelector('.tx-bar-list__row') as HTMLElement;
    expect(row.querySelector('.tx-bar-list__value')?.textContent?.replace(/\s/g, ' ').trim()).toBe('1 000,5');
    expect(row.querySelector('.tx-bar-list__percent')?.textContent?.trim()).toBe('33,3%');
  });

  it('applies dt, pt and unstyled', () => {
    expect(main().style.getPropertyValue('--tx-chart-bar-list-row-height')).toBe('32px');
    expect(main().classList).toContain('own-root');
    expect(main().querySelector('.tx-bar-list__bar')?.classList).toContain('own-bar');
    expect(main().hasAttribute('data-styled')).toBe(true);
    expect((fixture.nativeElement.querySelector('#plain') as HTMLElement).hasAttribute('data-styled')).toBe(false);
  });
});
