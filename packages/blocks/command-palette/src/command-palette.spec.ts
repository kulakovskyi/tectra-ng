import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxCommandPalette } from './command-palette.component';
import {
  TxCommandPaletteFilterPipe,
  TxMenuPaletteItemsPipe,
  filterPaletteItems,
  menuPaletteItems,
} from './command-palette.pipes';
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

@Component({
  imports: [TxCommandPalette],
  template: `
    <tx-command-palette
      label="Jump"
      [items]="items()"
      (itemSelect)="picked.push($event.id)"
      (opened)="opens = opens + 1"
      (closed)="closes = closes + 1"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RemoteHost {
  readonly picked: string[] = [];
  opens = 0;
  closes = 0;
  readonly items = signal<TxCommandPaletteItem[]>([
    { id: 'zones', group: 'dns', label: 'Zones', routerLink: ['/dns', 'zones'], queryParams: { tab: 'all' } },
    { id: 'records', group: 'dns', label: 'Records' },
    { id: 'help', group: 'help', label: 'Help' },
  ]);
}

@Component({
  imports: [TxCommandPaletteFilterPipe, TxMenuPaletteItemsPipe],
  template: `
    @for (item of menu | menuPaletteItems | commandPaletteFilter: query(); track item.id) {
      <span class="page">{{ item.label }}</span>
    }
    @for (item of menu | menuPaletteItems: 'nav'; track item.id) {
      <span class="group">{{ item.group }}</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PipesHost {
  readonly query = signal<string | null>(null);
  readonly menu: TxPanelMenuItem[] = [
    { label: 'Home', routerLink: '/' },
    { label: 'Settings', items: [{ label: 'Profile', routerLink: '/profile' }] },
  ];
}

describe('TxCommandPalette keyboard, platform and layer edges', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Page }])],
    }),
  );

  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  async function setup() {
    const fixture = TestBed.createComponent(RemoteHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-command-palette') as HTMLElement;
    const palette = fixture.debugElement.query(By.directive(TxCommandPalette)).componentInstance as TxCommandPalette;
    return { fixture, root, palette };
  }

  const key = (target: HTMLElement, name: string, extra: KeyboardEventInit = {}) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...extra }));

  it('shows the Mac shortcut on Apple platforms', async () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    const { fixture, root } = await setup();
    await fixture.whenStable();
    const trigger = root.querySelector('.tx-command-palette__trigger') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-keyshortcuts')).toBe('Meta+K');
    expect(root.querySelector('.tx-command-palette__kbd')?.textContent?.trim()).toBe('⌘K');
  });

  it('falls back to the user agent and then to a PC layout when the platform is unknown', async () => {
    const platform = vi.spyOn(navigator, 'platform', 'get').mockReturnValue(undefined as unknown as string);
    const agent = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone)');
    const apple = await setup();
    await apple.fixture.whenStable();
    expect(apple.root.querySelector('.tx-command-palette__kbd')?.textContent?.trim()).toBe('⌘K');

    platform.mockReturnValue(undefined as unknown as string);
    agent.mockReturnValue(undefined as unknown as string);
    const other = await setup();
    await other.fixture.whenStable();
    expect(other.root.querySelector('.tx-command-palette__kbd')?.textContent?.trim()).toBe('Ctrl K');
  });

  it('opens once, closes once and toggles closed with the shortcut', async () => {
    const { fixture, root, palette } = await setup();
    const host = fixture.componentInstance;
    palette.close();
    expect(host.closes).toBe(0);
    palette.open();
    palette.open();
    await fixture.whenStable();
    expect(host.opens).toBe(1);
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Jump');
    expect((document.querySelector('.tx-command-palette__input') as HTMLInputElement).placeholder).toBe('Jump');
    expect(root.querySelector('.tx-command-palette__trigger-text')?.textContent?.trim()).toBe('Jump');

    key(document.body, 'K', { metaKey: true });
    await fixture.whenStable();
    expect(host.closes).toBe(1);
    expect(palette.isOpen()).toBe(false);
    key(document.body, 'Escape');
    expect(host.closes).toBe(1);
  });

  it('shows unknown groups by their key, moves with Home, End and the arrows and navigates with query params', async () => {
    const { fixture, palette } = await setup();
    palette.open();
    await fixture.whenStable();
    expect(Array.from(document.querySelectorAll('.tx-command-palette__group')).map((group) => group.textContent?.trim())).toEqual(['dns', 'help']);
    const input = document.querySelector('.tx-command-palette__input') as HTMLInputElement;
    const options = () => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
    const selected = () => options().findIndex((option) => option.getAttribute('aria-selected') === 'true');

    key(input, 'ArrowDown');
    await fixture.whenStable();
    expect(selected()).toBe(1);
    key(input, 'End');
    await fixture.whenStable();
    expect(selected()).toBe(1);
    key(options()[1], 'End');
    await fixture.whenStable();
    expect(selected()).toBe(2);
    key(options()[2], 'Home');
    await fixture.whenStable();
    expect(selected()).toBe(0);
    key(options()[0], 'Tab');
    expect(selected()).toBe(0);
    options()[1].dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(selected()).toBe(1);
    options()[0].dispatchEvent(new MouseEvent('mouseenter'));

    key(input, 'Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.picked).toEqual(['zones']);
    expect(TestBed.inject(Router).url).toBe('/dns/zones?tab=all');
  });

  it('ignores Enter, Home, End and the arrows without results and closes on a mask click', async () => {
    const { fixture, palette } = await setup();
    fixture.componentInstance.items.set([]);
    palette.open();
    await fixture.whenStable();
    const panel = document.querySelector('[role="dialog"]') as HTMLElement;
    const list = document.querySelector('[role="listbox"]') as HTMLElement;
    for (const name of ['ArrowDown', 'ArrowUp', 'End', 'Enter']) {
      key(list, name);
    }
    expect(palette.activeIndex()).toBe(0);
    expect(palette.isOpen()).toBe(true);
    panel.click();
    expect(palette.isOpen()).toBe(true);
    (document.querySelector('.tx-command-palette__overlay') as HTMLElement).click();
    expect(palette.isOpen()).toBe(false);
  });

  it('leaves the page scroll alone when the palette is not in the document', async () => {
    const { fixture, palette } = await setup();
    (fixture.nativeElement as HTMLElement).remove();
    palette.open();
    expect(palette.isOpen()).toBe(true);
    expect(document.body.style.overflow).toBe('');
    palette.close();
    expect(document.body.style.overflow).toBe('');
  });

  it('runs a router item without a router', async () => {
    TestBed.overrideProvider(Router, { useValue: null });
    const { fixture, palette } = await setup();
    palette.select(fixture.componentInstance.items()[0]);
    expect(fixture.componentInstance.picked).toEqual(['zones']);
  });
});

describe('palette pipes', () => {
  it('turn a menu into page items in a template and filter them', async () => {
    const fixture = TestBed.createComponent(PipesHost);
    await fixture.whenStable();
    const pages = () => Array.from(fixture.nativeElement.querySelectorAll('.page')).map((node) => (node as HTMLElement).textContent);
    expect(pages()).toEqual(['Home', 'Profile']);
    expect(Array.from(fixture.nativeElement.querySelectorAll('.group')).map((node) => (node as HTMLElement).textContent)).toEqual(['nav', 'nav']);
    fixture.componentInstance.query.set('settings');
    await fixture.whenStable();
    expect(pages()).toEqual(['Profile']);
  });

  it('skip hidden nodes, keep the first of duplicate pages and fill in labels and icons', () => {
    expect(menuPaletteItems(null)).toEqual([]);
    expect(menuPaletteItems(undefined, 'nav')).toEqual([]);
    const items = menuPaletteItems([
      { routerLink: '/blank' },
      { label: 'Hidden', routerLink: '/hidden', visible: false },
      { separator: true },
      { items: [{ label: 'One', routerLink: '/same' }, { label: 'Two', routerLink: '/same' }] },
    ]);
    expect(items).toEqual([
      { id: 'page:/blank:{}', group: 'pages', label: '', sublabel: undefined, icon: 'file', routerLink: '/blank', queryParams: undefined },
      { id: 'page:/same:{}', group: 'pages', label: 'One', sublabel: undefined, icon: 'file', routerLink: '/same', queryParams: undefined },
    ]);
    expect(filterPaletteItems(items, null)).toEqual(items);
    expect(filterPaletteItems(items, 'one').map((item) => item.label)).toEqual(['One']);
  });
});
