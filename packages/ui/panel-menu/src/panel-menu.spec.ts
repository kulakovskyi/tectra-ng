import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TxPanelMenu } from './panel-menu.component';
import { TxPanelMenuItemTemplate } from './panel-menu.templates';
import { TxPanelMenuExpandedKeys, TxPanelMenuItem, TxPanelMenuItemEvent, TxPanelMenuVariant } from './panel-menu.types';

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
