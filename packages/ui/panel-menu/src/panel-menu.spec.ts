import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TxPanelMenu } from './panel-menu.component';
import { TxPanelMenuItemTemplate } from './panel-menu.templates';
import { TxPanelMenuExpandedKeys, TxPanelMenuItem, TxPanelMenuItemEvent, TxPanelMenuVariant } from './panel-menu.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Blank {}

@Component({
  imports: [TxPanelMenu, TxPanelMenuItemTemplate],
  template: `
    <tx-panel-menu
      id="menu"
      [model]="model()"
      [variant]="variant()"
      [multiple]="multiple()"
      [(expandedKeys)]="keys"
      [unstyled]="unstyled()"
      (itemClick)="clicks.push($event)"
      [dt]="{ panel: { padding: '6px' } }"
      [pt]="{ item: { class: 'my-item' }, panel: { class: 'my-panel' } }"
    />
    <tx-panel-menu id="templated" [model]="model()">
      <ng-template txPanelMenuItem let-item let-level="level" let-expanded="expanded">
        <span class="own">{{ item.label }} {{ level }} {{ expanded }}</span>
      </ng-template>
    </tx-panel-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly commands: string[] = [];
  readonly model = signal<TxPanelMenuItem[]>([
    {
      label: 'Files',
      icon: 'folder',
      items: [
        { label: 'Documents', items: [{ label: 'Invoices', command: () => this.commands.push('invoices') }, { label: 'Contracts' }] },
        { label: 'Images', badge: 3 },
        { label: 'Archive', disabled: true },
      ],
    },
    { label: 'Cloud', items: [{ label: 'Upload' }, { label: 'Download' }] },
    { label: 'Help', command: () => this.commands.push('help') },
  ]);
  readonly variant = signal<TxPanelMenuVariant>('panel');
  readonly multiple = signal(false);
  readonly unstyled = signal(false);
  keys: TxPanelMenuExpandedKeys = {};
  readonly clicks: TxPanelMenuItemEvent[] = [];
}

@Component({
  imports: [TxPanelMenu],
  template: `<tx-panel-menu id="sidebar" variant="sidebar" [model]="model" [(expandedKeys)]="keys" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SidebarHost {
  keys: TxPanelMenuExpandedKeys = {};
  readonly model: TxPanelMenuItem[] = [
    {
      label: 'Workspace',
      items: [
        { label: 'Dashboard', icon: 'home', routerLink: '/', routerLinkActiveOptions: { exact: true } },
        {
          label: 'Reports',
          icon: 'chart-bar',
          items: [
            { label: 'Daily', routerLink: '/reports/daily', badge: 120 },
            { label: 'Weekly', routerLink: '/reports/weekly', badge: 0 },
          ],
        },
        { label: 'Settings', items: [{ label: 'Team', routerLink: '/settings/team' }] },
        { label: 'Billing', routerLink: '/billing', disabled: true },
      ],
    },
  ];
}

function keydown(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxPanelMenu panel', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const headers = () => all('#menu .tx-panel-menu__header');
  const items = () => all('#menu [role="treeitem"]');

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders panels with header buttons wired to their regions', () => {
    const [files, , help] = headers();
    expect(all('#menu .tx-panel-menu__panel')).toHaveLength(3);
    expect(el('#menu .tx-panel-menu__panel').classList).toContain('my-panel');
    expect(files.tagName).toBe('BUTTON');
    expect(files.getAttribute('aria-expanded')).toBe('false');
    const region = el(`#${files.getAttribute('aria-controls')}`);
    expect(region.getAttribute('role')).toBe('region');
    expect(region.hasAttribute('inert')).toBe(true);
    expect(help.hasAttribute('aria-expanded')).toBe(false);
    expect(el('#menu').style.getPropertyValue('--tx-panel-menu-panel-padding')).toBe('6px');
    expect(files.querySelector('tx-icon[data-icon="folder"]')).not.toBeNull();
  });

  it('opens one root panel at a time and reports the keys', async () => {
    const [files, cloud] = headers();
    files.click();
    await fixture.whenStable();
    expect(files.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.componentInstance.keys).toEqual({ '0': true, '1': false, '2': false });
    cloud.click();
    await fixture.whenStable();
    expect(files.getAttribute('aria-expanded')).toBe('false');
    expect(cloud.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps several panels open with multiple', async () => {
    fixture.componentInstance.multiple.set(true);
    await fixture.whenStable();
    const [files, cloud] = headers();
    files.click();
    cloud.click();
    await fixture.whenStable();
    expect(files.getAttribute('aria-expanded')).toBe('true');
    expect(cloud.getAttribute('aria-expanded')).toBe('true');
  });

  it('builds a tree with nested groups, badges and disabled items', async () => {
    headers()[0].click();
    await fixture.whenStable();
    const [documents, , , images, archive] = items();
    expect(el('#menu [role="tree"]').getAttribute('aria-labelledby')).toBe(headers()[0].id);
    expect(documents.getAttribute('aria-level')).toBe('1');
    expect(documents.getAttribute('aria-expanded')).toBe('false');
    expect(documents.getAttribute('aria-owns')).toBe(el('#menu [role="group"]').id);
    expect(documents.classList).toContain('my-item');
    expect(images.querySelector('tx-badge')).not.toBeNull();
    expect(archive.getAttribute('aria-disabled')).toBe('true');
    documents.click();
    await fixture.whenStable();
    expect(documents.getAttribute('aria-expanded')).toBe('true');
    expect(items()[1].getAttribute('aria-level')).toBe('2');
  });

  it('runs commands and emits itemClick, but not for disabled items', async () => {
    headers()[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.commands).toEqual(['help']);
    expect(fixture.componentInstance.clicks.map((event) => event.item.label)).toEqual(['Help']);
    headers()[0].click();
    await fixture.whenStable();
    items()[4].click();
    expect(fixture.componentInstance.clicks).toHaveLength(2);
  });

  it('moves through the tree with the keyboard', async () => {
    headers()[0].click();
    await fixture.whenStable();
    const documents = items()[0];
    expect(documents.getAttribute('tabindex')).toBe('0');
    documents.focus();
    keydown(documents, 'ArrowRight');
    await fixture.whenStable();
    expect(documents.getAttribute('aria-expanded')).toBe('true');
    keydown(documents, 'ArrowRight');
    expect(document.activeElement?.querySelector('.tx-panel-menu__label')?.textContent).toBe('Invoices');
    keydown(document.activeElement as HTMLElement, 'Enter');
    expect(fixture.componentInstance.commands).toEqual(['invoices']);
    keydown(document.activeElement as HTMLElement, 'ArrowLeft');
    expect(document.activeElement).toBe(documents);
    keydown(documents, 'ArrowLeft');
    await fixture.whenStable();
    expect(documents.getAttribute('aria-expanded')).toBe('false');
    keydown(documents, 'End');
    expect(document.activeElement?.querySelector('.tx-panel-menu__label')?.textContent).toBe('Images');
    keydown(document.activeElement as HTMLElement, 'Home');
    expect(document.activeElement).toBe(documents);
  });

  it('moves between headers with the arrows', () => {
    const [files, cloud, help] = headers();
    files.focus();
    keydown(files, 'ArrowDown');
    expect(document.activeElement).toBe(cloud);
    keydown(cloud, 'ArrowUp');
    expect(document.activeElement).toBe(files);
    keydown(files, 'ArrowDown');
    const other = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
    cloud.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(cloud);
    keydown(cloud, 'End');
    expect(document.activeElement).toBe(help);
    keydown(help, 'Home');
    expect(document.activeElement).toBe(files);
  });

  it('renders the item template', () => {
    expect(all('#templated .tx-panel-menu__header .own').map((own) => own.textContent)).toEqual(['Files 0 false', 'Cloud 0 false', 'Help 0 false']);
    expect(all('#templated [role="treeitem"] .own')[0].textContent).toBe('Documents 1 false');
  });

  it('drops the styles when unstyled', async () => {
    fixture.componentInstance.unstyled.set(true);
    await fixture.whenStable();
    expect(el('#menu').hasAttribute('data-styled')).toBe(false);
  });
});

describe('TxPanelMenu sidebar', () => {
  let fixture: ComponentFixture<SidebarHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const item = (label: string) =>
    (Array.from(fixture.nativeElement.querySelectorAll('[role="treeitem"]')) as HTMLElement[]).find(
      (element) => element.querySelector('.tx-panel-menu__label')?.textContent?.trim() === label,
    ) as HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
    fixture = TestBed.createComponent(SidebarHost);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl('/reports/daily');
    await fixture.whenStable();
  });

  it('shows section titles that name their tree', () => {
    const title = el('.tx-panel-menu__section');
    expect(title.textContent?.trim()).toBe('Workspace');
    expect(el('[role="tree"]').getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('marks the current route and opens its parents', () => {
    const daily = item('Daily');
    expect(daily.tagName).toBe('A');
    expect(daily.getAttribute('href')).toBe('/reports/daily');
    expect(daily.classList).toContain('tx-panel-menu__item--active');
    expect(daily.getAttribute('aria-current')).toBe('page');
    expect(item('Reports').getAttribute('aria-expanded')).toBe('true');
    expect(item('Dashboard').classList).not.toContain('tx-panel-menu__item--active');
    expect(fixture.componentInstance.keys).toEqual({ '0': true, '0-1': true });
  });

  it('follows navigation and closes the other branches', async () => {
    await TestBed.inject(Router).navigateByUrl('/settings/team');
    await fixture.whenStable();
    expect(item('Settings').getAttribute('aria-expanded')).toBe('true');
    expect(item('Reports').getAttribute('aria-expanded')).toBe('false');
    expect(item('Team').classList).toContain('tx-panel-menu__item--active');
  });

  it('caps badges, hides zero and locks disabled items', () => {
    expect(item('Daily').querySelector('.tx-panel-menu__badge')?.textContent).toBe('99+');
    expect(item('Weekly').querySelector('.tx-panel-menu__badge')).toBeNull();
    const billing = item('Billing');
    expect(billing.tagName).toBe('DIV');
    expect(billing.getAttribute('aria-disabled')).toBe('true');
    expect(billing.querySelector('.tx-panel-menu__lock')).not.toBeNull();
  });

  it('closes sibling branches when one opens', async () => {
    item('Settings').click();
    await fixture.whenStable();
    expect(item('Settings').getAttribute('aria-expanded')).toBe('true');
    expect(item('Reports').getAttribute('aria-expanded')).toBe('false');
  });
});

@Component({
  imports: [TxPanelMenu],
  template: `<tx-panel-menu variant="sidebar" [model]="model()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ActiveHost {
  readonly current = signal('Website');
  readonly model = computed<TxPanelMenuItem[]>(() => [
    {
      label: 'Projects',
      items: ['Website', 'Shop'].map((label) => ({ label, active: label === this.current(), command: () => this.current.set(label) })),
    },
  ]);
}

describe('TxPanelMenu active items', () => {
  it('marks the item flagged active without a router and follows the flag', async () => {
    const fixture = TestBed.createComponent(ActiveHost);
    await fixture.whenStable();
    const items = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-panel-menu__item')) as HTMLElement[];
    expect(items().map((item) => item.getAttribute('aria-current'))).toEqual(['page', null]);
    items()[1].click();
    await fixture.whenStable();
    expect(items().map((item) => item.classList.contains('tx-panel-menu__item--active'))).toEqual([false, true]);
  });
});

@Component({
  imports: [TxPanelMenu],
  template: `<tx-panel-menu [variant]="variant()" [collapsed]="collapsed()" [model]="model" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CollapsedHost {
  readonly variant = signal<TxPanelMenuVariant>('sidebar');
  readonly collapsed = signal(true);
  readonly model: TxPanelMenuItem[] = [{ label: 'Main', items: [{ label: 'Inbox', icon: 'inbox', badge: 3 }] }];
}

describe('TxPanelMenu collapsed', () => {
  it('marks a collapsed sidebar and keeps the labels for screen readers', async () => {
    const fixture = TestBed.createComponent(CollapsedHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-panel-menu') as HTMLElement;
    expect(root.classList).toContain('tx-panel-menu--collapsed');
    expect(root.querySelector('.tx-panel-menu__label')?.textContent?.trim()).toBe('Inbox');
    fixture.componentInstance.collapsed.set(false);
    await fixture.whenStable();
    expect(root.classList).not.toContain('tx-panel-menu--collapsed');
    fixture.componentInstance.collapsed.set(true);
    fixture.componentInstance.variant.set('panel');
    await fixture.whenStable();
    expect(root.classList).not.toContain('tx-panel-menu--collapsed');
  });
});

@Component({
  imports: [TxPanelMenu],
  template: `<tx-panel-menu ariaLabel="Main" [variant]="variant()" [model]="model()" [multiple]="multiple()" [(expandedKeys)]="keys" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FlexHost {
  readonly variant = signal<TxPanelMenuVariant>('panel');
  readonly model = signal<TxPanelMenuItem[]>([]);
  readonly multiple = signal(false);
  keys: TxPanelMenuExpandedKeys = {};
}

async function flex(model: TxPanelMenuItem[], variant: TxPanelMenuVariant = 'panel', setup?: (host: FlexHost) => void) {
  const fixture = TestBed.createComponent(FlexHost);
  fixture.componentInstance.model.set(model);
  fixture.componentInstance.variant.set(variant);
  setup?.(fixture.componentInstance);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement.querySelector('tx-panel-menu') as HTMLElement;
  const menu = fixture.debugElement.children[0].componentInstance as TxPanelMenu;
  const item = (label: string) =>
    (Array.from(root.querySelectorAll('[role="treeitem"], .tx-panel-menu__header')) as HTMLElement[]).find(
      (element) => element.querySelector('.tx-panel-menu__label')?.textContent?.trim() === label,
    ) as HTMLElement;
  return { fixture, root, menu, item };
}

function press(target: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('TxPanelMenu without a router', () => {
  it('renders router links and urls as plain links', async () => {
    const { root, item } = await flex([
      { label: 'Site', url: 'https://example.invalid', target: '_blank' },
      {
        label: 'Links',
        expanded: true,
        items: [
          { label: 'Docs', url: '/docs', title: 'Read the docs' },
          { label: 'Reports', routerLink: ['reports', 'daily'] },
          { label: 'Path', routerLink: '/path', active: false },
        ],
      },
    ]);
    expect(root.getAttribute('role')).toBe('navigation');
    expect(root.getAttribute('aria-label')).toBe('Main');
    const site = item('Site');
    expect(site.tagName).toBe('A');
    expect(site.getAttribute('href')).toBe('https://example.invalid');
    expect(site.getAttribute('rel')).toBe('noopener noreferrer');
    expect(item('Docs').getAttribute('href')).toBe('/docs');
    expect(item('Docs').getAttribute('title')).toBe('Read the docs');
    expect(item('Reports').getAttribute('href')).toBe('reports/daily');
    expect(item('Path').getAttribute('href')).toBe('/path');
    expect(root.querySelector('[aria-current]')).toBeNull();
  });
});

describe('TxPanelMenu sidebar trees', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] }));

  const model: TxPanelMenuItem[] = [
    { label: 'Home', routerLink: '/home', icon: 'custom-glyph' },
    { separator: true },
    {
      label: 'Group',
      items: [
        { label: 'Alpha' },
        { separator: true },
        { label: 'Beta', items: [{ label: 'Beta one' }] },
        { label: 'Gamma', disabled: true },
      ],
    },
    { label: 'Locked', items: [{ label: 'Off', disabled: true }] },
  ];

  it('draws a root leaf as its own named tree, separators and unknown icons', async () => {
    const { root, item } = await flex(model, 'sidebar');
    const trees = Array.from(root.querySelectorAll('[role="tree"]')) as HTMLElement[];
    expect(trees[0].getAttribute('aria-label')).toBe('Home');
    expect(trees[0].hasAttribute('aria-labelledby')).toBe(false);
    expect(root.querySelector(':scope > [role="separator"]')).not.toBeNull();
    expect(root.querySelector('li.tx-panel-menu__separator')?.getAttribute('aria-hidden')).toBe('true');
    expect(item('Home').querySelector('.tx-panel-menu__icon span')?.className).toBe('custom-glyph');
    expect(item('Off').hasAttribute('tabindex')).toBe(false);
    expect(Array.from(trees[2].querySelectorAll('[tabindex="0"]'))).toHaveLength(0);
  });

  it('skips separators and stays put at the edges of the tree', async () => {
    const { fixture, item } = await flex(model, 'sidebar');
    const alpha = item('Alpha');
    alpha.focus();
    press(alpha, 'ArrowDown');
    expect(document.activeElement).toBe(item('Beta'));
    press(item('Beta'), 'ArrowUp');
    expect(document.activeElement).toBe(alpha);
    expect(press(alpha, 'ArrowRight').defaultPrevented).toBe(true);
    expect(press(alpha, 'ArrowLeft').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(alpha);
    expect(press(alpha, 'ArrowUp').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(alpha);
    expect(press(alpha, 'x').defaultPrevented).toBe(false);
    expect(press(item('Gamma'), 'ArrowDown').defaultPrevented).toBe(false);
    press(item('Beta'), 'ArrowRight');
    await fixture.whenStable();
    press(item('Beta'), 'ArrowRight');
    expect(document.activeElement).toBe(item('Beta one'));
    press(item('Beta one'), 'ArrowDown');
    expect(document.activeElement).toBe(item('Beta one'));
  });

  it('keeps the root sections open and ignores toggles of leaves and disabled items', async () => {
    const { menu, fixture } = await flex(model, 'sidebar');
    const [home, , group] = menu.nodes();
    expect(menu.isExpanded(group)).toBe(true);
    menu.toggle(home);
    menu.toggle(group.children[3]);
    await fixture.whenStable();
    expect(fixture.componentInstance.keys).toEqual({});
  });

  it('matches array router links with custom active options', async () => {
    const { item, fixture } = await flex(
      [
        {
          label: 'Reports',
          items: [
            { label: 'Daily', routerLink: ['/reports', 'daily'], routerLinkActiveOptions: { paths: 'exact' } },
            { label: 'All', routerLink: '/reports', routerLinkActiveOptions: { exact: false } },
            { label: 'Index', routerLink: '/reports', routerLinkActiveOptions: { exact: true } },
          ],
        },
      ],
      'panel',
    );
    await TestBed.inject(Router).navigateByUrl('/reports/daily');
    await fixture.whenStable();
    expect(item('Daily').getAttribute('aria-current')).toBe('page');
    expect(item('All').getAttribute('aria-current')).toBe('page');
    expect(item('Index').hasAttribute('aria-current')).toBe(false);
    expect(item('Reports').getAttribute('aria-expanded')).toBe('true');
    expect(fixture.componentInstance.keys).toEqual({ '0': true });
  });

  it('adds the active branch to the open ones with multiple', async () => {
    const reports: TxPanelMenuItem[] = [
      { label: 'Reports', items: [{ label: 'Daily', routerLink: '/reports/daily' }] },
      { label: 'Other', items: [{ label: 'More' }] },
    ];
    const { fixture } = await flex(reports, 'panel', (host) => {
      host.multiple.set(true);
      host.keys = { '1': true };
    });
    await TestBed.inject(Router).navigateByUrl('/reports/daily');
    await fixture.whenStable();
    expect(fixture.componentInstance.keys).toEqual({ '1': true, '0': true });
  });

  it('leaves the keys alone when the active branch is the only open one', async () => {
    const initial: TxPanelMenuExpandedKeys = { '0': true, '1': false };
    const { fixture } = await flex([{ label: 'Reports', items: [{ label: 'Daily', routerLink: '/reports/daily' }] }, { label: 'Other', items: [{ label: 'More' }] }], 'panel', (host) => {
      host.keys = initial;
    });
    await TestBed.inject(Router).navigateByUrl('/reports/daily');
    await fixture.whenStable();
    expect(fixture.componentInstance.keys).toBe(initial);
  });

  it('closes the other open branches when the active one is already open', async () => {
    const { fixture } = await flex([{ label: 'Reports', items: [{ label: 'Daily', routerLink: '/reports/daily' }] }, { label: 'Other', items: [{ label: 'More' }] }], 'panel', (host) => {
      host.keys = { '0': true, '1': true };
    });
    await TestBed.inject(Router).navigateByUrl('/reports/daily');
    await fixture.whenStable();
    expect(fixture.componentInstance.keys).toEqual({ '0': true });
  });
});

describe('TxPanelMenuItemTemplate', () => {
  it('narrows the template context', () => {
    const directive = {} as TxPanelMenuItemTemplate;
    expect(TxPanelMenuItemTemplate.ngTemplateContextGuard(directive, { item: { label: 'A' } })).toBe(true);
    expect(TxPanelMenuItemTemplate.ngTemplateContextGuard(directive, null)).toBe(false);
  });
});

describe('TxPanelMenu router link target', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('opens a router link in the target of its item', async () => {
    const { item } = await flex([
      { label: 'Reports', routerLink: '/reports', target: '_blank' },
      { label: 'Links', expanded: true, items: [{ label: 'Daily', routerLink: '/daily', target: '_blank' }] },
    ]);
    expect(item('Reports').getAttribute('href')).toBe('/reports');
    expect(item('Reports').getAttribute('target')).toBe('_blank');
    expect(item('Daily').getAttribute('target')).toBe('_blank');
  });
});

@Component({
  imports: [TxPanelMenu],
  template: `<tx-panel-menu variant="sidebar" [model]="model()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PendingHost {
  readonly badge = signal(3);
  readonly model = computed<TxPanelMenuItem[]>(() => [
    { label: 'Home', routerLink: '/home' },
    { label: 'Tasks', routerLink: '/tasks', badge: this.badge() },
  ]);
}

describe('TxPanelMenu pending navigation', () => {
  let release: (allowed: boolean) => void = () => undefined;
  let fixture: ComponentFixture<PendingHost>;
  const item = (label: string) =>
    (Array.from(fixture.nativeElement.querySelectorAll('.tx-panel-menu__item')) as HTMLElement[]).find(
      (element) => element.querySelector('.tx-panel-menu__label')?.textContent?.trim() === label,
    ) as HTMLElement;
  const active = () => (Array.from(fixture.nativeElement.querySelectorAll('.tx-panel-menu__item--active')) as HTMLElement[]).map((element) => element.textContent?.trim());

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'home', component: Blank },
          { path: 'tasks', component: Blank, canActivate: [() => new Promise<boolean>((resolve) => (release = resolve))] },
        ]),
      ],
    });
    fixture = TestBed.createComponent(PendingHost);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl('/home');
    await fixture.whenStable();
  });

  it('marks the target active while the navigation runs and goes back when it is cancelled', async () => {
    expect(active()).toEqual(['Home']);
    const navigation = TestBed.inject(Router).navigateByUrl('/tasks');
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    expect(active()).toEqual(['Tasks3']);
    release(false);
    await navigation;
    await fixture.whenStable();
    expect(active()).toEqual(['Home']);
  });

  it('keeps the target active once the navigation ends', async () => {
    const navigation = TestBed.inject(Router).navigateByUrl('/tasks');
    await new Promise((resolve) => setTimeout(resolve));
    release(true);
    await navigation;
    await fixture.whenStable();
    expect(active()).toEqual(['Tasks3']);
  });

  it('replays the badge entrance only when its value changes', async () => {
    const badge = item('Tasks').querySelector('.tx-panel-menu__badge') as HTMLElement;
    fixture.componentInstance.badge.set(4);
    await fixture.whenStable();
    expect(badge.textContent).toBe('4');
    const names: string[] = [];
    Object.defineProperty(badge, 'getAnimations', { configurable: true, value: () => [] });
    Object.defineProperty(badge, 'offsetWidth', { configurable: true, get: () => (names.push(badge.style.animationName), 0) });
    fixture.componentInstance.badge.set(4);
    await fixture.whenStable();
    expect(names).toEqual([]);
    fixture.componentInstance.badge.set(5);
    await fixture.whenStable();
    expect(names).toEqual(['none']);
    Reflect.deleteProperty(badge, 'getAnimations');
    Reflect.deleteProperty(badge, 'offsetWidth');
  });

});
