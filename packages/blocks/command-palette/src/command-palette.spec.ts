import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TxCommandPalette } from './command-palette.component';
import { filterPaletteItems, menuPaletteItems } from './command-palette.pipes';
import { TxCommandPaletteItem } from './command-palette.types';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

@Component({
  imports: [TxCommandPalette],
  template: `
    <tx-command-palette
      placeholder="Search pages"
      [items]="items"
      [groupLabels]="{ pages: 'Pages', actions: 'Actions' }"
      [loading]="loading()"
      [debounceTime]="0"
      localFilter
      (searchChange)="terms.push($event)"
      (itemSelect)="picked.push($event.id)"
      (closed)="closes = closes + 1"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly loading = signal(false);
  readonly terms: string[] = [];
  readonly picked: string[] = [];
  closes = 0;
  ran = 0;
  readonly items: TxCommandPaletteItem[] = [
    { id: 'home', group: 'pages', label: 'Dashboard', icon: 'home', routerLink: '/dashboard' },
    { id: 'reports', group: 'pages', label: 'Reports', sublabel: 'Main', routerLink: '/reports' },
    { id: 'theme', group: 'actions', label: 'Switch theme', command: () => (this.ran = this.ran + 1) },
  ];
}

describe('TxCommandPalette', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'dashboard', component: Page }, { path: 'reports', component: Page }])],
    }),
  );

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()));

  async function open() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-command-palette') as HTMLElement;
    (root.querySelector('.tx-command-palette__trigger') as HTMLButtonElement).click();
    await fixture.whenStable();
    return { fixture, root, input: document.querySelector('.tx-command-palette__input') as HTMLInputElement };
  }

  const key = (target: HTMLElement, name: string, extra: KeyboardEventInit = {}) => target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...extra }));

  it('opens a combobox dialog with grouped results and the first one active', async () => {
    const { input } = await open();
    expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Search');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.placeholder).toBe('Search pages');
    expect(Array.from(document.querySelectorAll('.tx-command-palette__group')).map((group) => group.textContent?.trim())).toEqual(['Pages', 'Actions']);
    const options = document.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(3);
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
    expect(document.querySelector('.tx-command-palette__sublabel')?.textContent?.trim()).toBe('Main');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('filters locally, moves with the arrows and runs a command on Enter', async () => {
    const { fixture, input } = await open();
    input.value = 'th';
    input.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    expect(Array.from(document.querySelectorAll('[role="option"]')).map((option) => option.textContent?.trim())).toEqual(['Switch theme']);
    expect(fixture.componentInstance.terms).toEqual(['th']);

    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    key(input, 'ArrowUp');
    await fixture.whenStable();
    expect(document.querySelectorAll('[role="option"]')[2].getAttribute('aria-selected')).toBe('true');
    key(input, 'Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.ran).toBe(1);
    expect(fixture.componentInstance.picked).toEqual(['theme']);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('navigates to a router item, shows the empty and loading rows, and toggles with the shortcut', async () => {
    const { fixture, input } = await open();
    (document.querySelectorAll<HTMLButtonElement>('[role="option"]')[1]).click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/reports');
    expect(fixture.componentInstance.closes).toBe(1);

    key(document.body, 'k', { ctrlKey: true });
    await fixture.whenStable();
    const field = document.querySelector('.tx-command-palette__input') as HTMLInputElement;
    field.value = 'zzz';
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(document.querySelector('.tx-command-palette__status--empty')?.textContent?.trim()).toBe('Nothing found');
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(document.querySelector('.tx-command-palette__status')?.textContent?.trim()).toBe('Searching…');
    key(field, 'Escape');
    await fixture.whenStable();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(input.isConnected).toBe(false);
  });
});

describe('palette helpers', () => {
  it('turn a sidebar menu into page items and filter them', () => {
    const items = menuPaletteItems([
      { label: 'Main', items: [{ label: 'Dashboard', icon: 'home', routerLink: '/' }, { label: 'Locked', routerLink: '/x', disabled: true }] },
      { label: 'Domains', items: [{ label: 'DNS', items: [{ label: 'Zones', routerLink: ['/dns', 'zones'] }] }] },
    ]);
    expect(items.map((item) => [item.label, item.sublabel])).toEqual([
      ['Dashboard', 'Main'],
      ['Zones', 'DNS'],
    ]);
    expect(filterPaletteItems(items, 'dns').map((item) => item.label)).toEqual(['Zones']);
  });
});
