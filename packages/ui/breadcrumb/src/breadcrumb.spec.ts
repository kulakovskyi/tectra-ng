import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TxBreadcrumb } from './breadcrumb.component';
import { TxBreadcrumbItemTemplate, TxBreadcrumbSeparatorTemplate } from './breadcrumb.templates';
import { TxBreadcrumbItem, TxBreadcrumbItemEvent, TxBreadcrumbSeparator } from './breadcrumb.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

@Component({
  imports: [TxBreadcrumb],
  template: `
    <tx-breadcrumb
      id="crumbs"
      [home]="home"
      [model]="items()"
      [separator]="separator()"
      [dt]="{ item: { gap: '4px' } }"
      [pt]="{ label: { class: 'own-label' } }"
      (itemClick)="clicked.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly separator = signal<TxBreadcrumbSeparator>('chevron');
  readonly clicks: string[] = [];
  readonly clicked: TxBreadcrumbItemEvent[] = [];
  readonly home: TxBreadcrumbItem = { icon: 'home', routerLink: '/', ariaLabel: 'Home' };
  readonly items = signal<TxBreadcrumbItem[]>([
    { label: 'Projects', routerLink: ['/projects'], queryParams: { page: 2 } },
    { label: 'Docs', url: 'https://example.com/docs', target: '_blank' },
    { label: 'Archive', disabled: true, routerLink: '/archive' },
    { label: 'Filter', command: (event) => this.clicks.push(event.item.label ?? '') },
    { label: 'Website', routerLink: '/website' },
  ]);
}

@Component({
  imports: [TxBreadcrumb, TxBreadcrumbItemTemplate, TxBreadcrumbSeparatorTemplate],
  template: `
    <tx-breadcrumb id="own" [model]="items" unstyled ariaLabel="Path">
      <ng-template txBreadcrumbItem let-item let-current="current">
        <b class="own-item">{{ item.label }}{{ current ? '!' : '' }}</b>
      </ng-template>
      <ng-template txBreadcrumbSeparator><i class="own-separator">»</i></ng-template>
    </tx-breadcrumb>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateHost {
  readonly items: TxBreadcrumbItem[] = [{ label: 'Team', url: '/team' }, { label: 'Members' }];
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxBreadcrumb', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Page }])] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a labelled nav with an ordered list, home first and the last item as the current page', () => {
    const nav = el('#crumbs nav');
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    const items = all('#crumbs ol > li');
    expect(items).toHaveLength(6);
    expect(items[0].querySelector('a')?.getAttribute('aria-label')).toBe('Home');
    expect(items[0].querySelector('tx-icon')?.getAttribute('data-icon')).toBe('home');
    const current = items[5].querySelector('.tx-breadcrumb__link') as HTMLElement;
    expect(current.tagName).toBe('SPAN');
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(items[5].classList).toContain('tx-breadcrumb__item--current');
  });

  it('draws hidden separators between items', async () => {
    const separators = all('#crumbs .tx-breadcrumb__separator');
    expect(separators).toHaveLength(5);
    expect(separators.every((separator) => separator.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(separators[0].querySelector('tx-icon')?.getAttribute('data-icon')).toBe('chevron-right');
    fixture.componentInstance.separator.set('slash');
    await fixture.whenStable();
    expect(el('#crumbs').getAttribute('data-separator')).toBe('slash');
    expect(el('#crumbs .tx-breadcrumb__separator').textContent?.trim()).toBe('/');
  });

  it('renders router links, urls, commands and disabled items', async () => {
    const items = all('#crumbs ol > li');
    const router = items[1].querySelector('a') as HTMLAnchorElement;
    expect(router.getAttribute('href')).toBe('/projects?page=2');
    const url = items[2].querySelector('a') as HTMLAnchorElement;
    expect(url.getAttribute('href')).toBe('https://example.com/docs');
    expect(url.getAttribute('target')).toBe('_blank');
    expect(url.getAttribute('rel')).toBe('noopener noreferrer');
    const disabled = items[3].querySelector('.tx-breadcrumb__link') as HTMLElement;
    expect(disabled.tagName).toBe('SPAN');
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    const command = items[4].querySelector('button') as HTMLButtonElement;
    command.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks).toEqual(['Filter']);
    expect(fixture.componentInstance.clicked.map((event) => event.item.label)).toEqual(['Filter']);
  });

  it('applies dt and pt', () => {
    expect(el('#crumbs').style.getPropertyValue('--tx-breadcrumb-item-gap')).toBe('4px');
    expect(el('#crumbs').hasAttribute('data-styled')).toBe(true);
    expect(all('#crumbs .tx-breadcrumb__label.own-label')).toHaveLength(5);
  });

  it('uses own item and separator templates and drops the styles when unstyled', async () => {
    const own = TestBed.createComponent(TemplateHost);
    own.autoDetectChanges();
    await own.whenStable();
    const root = own.nativeElement.querySelector('#own') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(false);
    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Path');
    expect(Array.from(root.querySelectorAll('.own-item')).map((item) => item.textContent)).toEqual(['Team', 'Members!']);
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/team');
    expect(root.querySelectorAll('.own-separator')).toHaveLength(1);
  });
});

@Component({
  imports: [TxBreadcrumb],
  template: `<tx-breadcrumb id="plain" [model]="items" [pt]="{ text: { class: 'own-text' } }" (itemClick)="clicked.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  readonly items: TxBreadcrumbItem[] = [
    { label: 'Root', icon: 'own-root-icon' },
    { label: 'Team', routerLink: ['teams', 'core'] },
    { label: 'Board', routerLink: '/board' },
    { label: 'Now' },
  ];
  readonly clicked: TxBreadcrumbItemEvent[] = [];
}

describe('TxBreadcrumb without a router', () => {
  let fixture: ComponentFixture<PlainHost>;
  const items = () => Array.from(fixture.nativeElement.querySelectorAll('#plain ol > li')) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(PlainHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders router links as plain links and items without an action as text', () => {
    const [root, team, board] = items();
    const text = root.querySelector('.tx-breadcrumb__text') as HTMLElement;
    expect(text.tagName).toBe('SPAN');
    expect(text.classList).toContain('own-text');
    expect(text.hasAttribute('aria-current')).toBe(false);
    expect(root.querySelector('.tx-breadcrumb__link')).toBeNull();
    expect(root.querySelector('span.tx-breadcrumb__icon.own-root-icon')).not.toBeNull();
    expect(team.querySelector('a')?.getAttribute('href')).toBe('teams/core');
    expect(board.querySelector('a')?.getAttribute('href')).toBe('/board');
  });

  it('does not report a click on a disabled item', () => {
    const breadcrumb = fixture.debugElement.query((node) => node.componentInstance instanceof TxBreadcrumb).componentInstance as TxBreadcrumb;
    const event = new MouseEvent('click', { cancelable: true });
    breadcrumb.select(event, { label: 'Off', disabled: true });
    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.clicked).toEqual([]);
  });

  it('narrows the item template context', () => {
    expect(TxBreadcrumbItemTemplate.ngTemplateContextGuard({} as TxBreadcrumbItemTemplate, { $implicit: {}, current: false, index: 0 })).toBe(true);
  });
});

describe('TxBreadcrumb recompiled by TestBed', () => {
  it('still finds its templates when a test overrides the component', async () => {
    TestBed.overrideComponent(TxBreadcrumb, { set: { styles: [] } });
    const fixture = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.own-item')).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('.own-separator')).toHaveLength(1);
  });
});

@Component({
  imports: [TxBreadcrumb],
  template: `<tx-breadcrumb id="tabs" [model]="[{ label: 'Reports', routerLink: '/reports', target: '_blank' }, { label: 'Today' }]" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TargetHost {}

describe('TxBreadcrumb router link target', () => {
  it('opens a router link in the target of its item', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Page }])] });
    const fixture = TestBed.createComponent(TargetHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const link = fixture.nativeElement.querySelector('#tabs a') as HTMLElement;
    expect(link.getAttribute('href')).toBe('/reports');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
