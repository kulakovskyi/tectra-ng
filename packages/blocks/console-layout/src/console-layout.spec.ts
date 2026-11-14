import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By, Title } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { TxConsoleLayout } from './console-layout.component';
import { TxConsoleRailItem } from './console-layout.types';
import { TxConsolePanel } from './console-panel.component';
import { TX_CONSOLE_RAIL_SECTION_MATCH } from './console-rail-match';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

@Component({
  imports: [TxConsoleLayout, TxConsolePanel],
  template: `
    <tx-console-layout
      title="Search"
      titleMuted="console"
      logo="/logo.svg"
      homeLink="/search"
      footerName="Search console"
      documentTitle="Search console"
      [railItems]="items"
      [crumbs]="crumbs()"
      [translate]="translate"
      [footerLinks]="[{ label: 'terms', routerLink: '/terms' }]"
      [dt]="{ rail: { width: '90px' } }"
    >
      <button txConsoleApps type="button" class="apps">Apps</button>
      <button txConsoleActions type="button" class="bell">Bell</button>
      @if (panel()) {
        <tx-console-panel label="Projects">
          <nav txConsolePanelAside class="tree" tabindex="-1">Tree</nav>
          <p class="page">Page</p>
        </tx-console-panel>
      } @else {
        <p class="page">Page</p>
      }
    </tx-console-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly panel = signal(false);
  readonly crumbs = signal<string[] | undefined>(undefined);
  readonly picked: string[] = [];
  readonly translate = (key: string) => (key === 'terms' ? 'Terms of use' : key);
  readonly items: TxConsoleRailItem[] = [
    { label: 'Projects', icon: 'folder', routerLink: '/search/projects', activeOptions: TX_CONSOLE_RAIL_SECTION_MATCH },
    { label: 'Help', icon: 'question-circle', url: 'https://example.com/help' },
    { label: 'Reload', icon: 'refresh', command: () => this.picked.push('reload'), active: true },
  ];
}

describe('TxConsoleLayout', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'search',
            data: { crumb: 'Search' },
            children: [{ path: 'projects', component: Page, data: { crumb: 'Projects' } }],
          },
        ]),
      ],
    }),
  );

  it('renders the brand, route crumbs, rail, slots and footer, and sets the tab title', async () => {
    const fixture = TestBed.createComponent(Host);
    await TestBed.inject(Router).navigateByUrl('/search/projects');
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-console-layout') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(true);
    expect(root.getAttribute('data-responsive')).toBe('viewport');
    expect(root.hasAttribute('title')).toBe(false);
    expect(root.querySelector('tx-console-rail')?.getAttribute('data-responsive')).toBe('viewport');
    expect(root.style.getPropertyValue('--tx-console-layout-rail-width')).toBe('90px');
    const brand = root.querySelector('a.tx-console-layout__brand') as HTMLAnchorElement;
    expect(brand.getAttribute('href')).toBe('/search');
    expect(brand.textContent?.replace(/\s+/g, ' ').trim()).toBe('Search console');
    const crumbs = Array.from(root.querySelectorAll('.tx-console-layout__crumb')).map((crumb) => crumb.textContent?.trim());
    expect(crumbs).toEqual(['Search', 'Projects']);
    expect(root.querySelector('.tx-console-layout__crumb--current')?.getAttribute('aria-current')).toBe('page');
    expect(root.querySelector('.tx-console-layout__apps .apps')).not.toBeNull();
    expect(root.querySelector('.tx-console-layout__actions .bell')).not.toBeNull();
    expect(root.querySelector('main .page')).not.toBeNull();

    const nav = root.querySelector('tx-console-rail nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Sections');
    const [projects, help, reload] = Array.from(nav.querySelectorAll<HTMLElement>('.tx-console-rail__item'));
    expect(projects.classList).toContain('tx-console-rail__item--active');
    expect(projects.getAttribute('aria-current')).toBe('page');
    expect(help.getAttribute('href')).toBe('https://example.com/help');
    expect(reload.tagName).toBe('BUTTON');
    expect(reload.classList).toContain('tx-console-rail__item--active');
    reload.click();
    expect(fixture.componentInstance.picked).toEqual(['reload']);

    const footer = root.querySelector('.tx-console-layout__footer') as HTMLElement;
    expect(footer.getAttribute('data-variant')).toBe('console');
    expect(footer.querySelector('a')?.textContent?.trim()).toBe('Terms of use');
    expect(TestBed.inject(Title).getTitle()).toBe('Projects · Search console');
  });

  it('uses own crumbs and moves the footer into a panel', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.crumbs.set(['Reports']);
    fixture.componentInstance.panel.set(true);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-console-layout') as HTMLElement;
    expect(Array.from(root.querySelectorAll('.tx-console-layout__crumb')).map((crumb) => crumb.textContent?.trim())).toEqual(['Reports']);
    expect(root.querySelector('.tx-console-layout__footer')).toBeNull();
    const panel = root.querySelector('tx-console-panel') as HTMLElement;
    expect(panel.getAttribute('data-responsive')).toBe('viewport');
    expect(panel.querySelector('aside')?.getAttribute('aria-label')).toBe('Projects');
    expect(panel.querySelector('.tx-console-panel__nav .tree')).not.toBeNull();
    const toggle = panel.querySelector('.tx-console-panel__toggle') as HTMLButtonElement;
    expect(toggle.textContent?.trim()).toBe('Projects');
    expect(toggle.getAttribute('aria-controls')).toBe(panel.querySelector('.tx-console-panel__nav')?.id);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    (panel.querySelector('.tree') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
    expect(panel.querySelector('.tx-console-panel__content .page')).not.toBeNull();
    expect(panel.querySelector('tx-app-footer')).not.toBeNull();

    fixture.componentInstance.panel.set(false);
    await fixture.whenStable();
    expect(root.querySelector('.tx-console-layout__footer')).not.toBeNull();
  });

  it('restores the tab title when the console is destroyed', async () => {
    const title = TestBed.inject(Title);
    title.setTitle('Docs');
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.crumbs.set(['Reports']);
    await fixture.whenStable();
    expect(title.getTitle()).toBe('Reports · Search console');
    fixture.destroy();
    expect(title.getTitle()).toBe('Docs');
  });
});

@Component({
  imports: [TxConsoleLayout],
  template: `
    <tx-console-layout title="Search" [favicon]="favicon()" [railItems]="items()">
      <p class="page">Page</p>
    </tx-console-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FaviconHost {
  readonly favicon = signal<string | undefined>('/console.ico');
  readonly items = signal<TxConsoleRailItem[]>([
    { label: 'Overview', icon: 'home', routerLink: '/search', queryParams: { tab: 'all' }, target: '_self' },
    { label: 'Docs', icon: 'book', url: 'https://example.com/docs', target: '_blank', active: true },
    { label: 'Noop', icon: 'refresh' },
  ]);
}

@Component({
  imports: [TxConsolePanel],
  template: `
    <tx-console-panel>
      <nav txConsolePanelAside class="tree">
        <a href="#one" class="link">One</a>
        <span class="text">Text</span>
      </nav>
      <a href="#page" class="page-link">Page link</a>
    </tx-console-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LonePanelHost {}

describe('TxConsoleLayout favicon, rail and lone panel', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Page }])],
    }),
  );
  afterEach(() => document.head.querySelectorAll('link[rel="icon"]').forEach((link) => link.remove()));

  it('swaps the favicon and restores it on destroy', async () => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = '/site.ico';
    document.head.appendChild(link);
    const fixture = TestBed.createComponent(FaviconHost);
    await fixture.whenStable();
    expect(link.getAttribute('href')).toBe('/console.ico');
    fixture.componentInstance.favicon.set('/alert.ico');
    await fixture.whenStable();
    expect(link.getAttribute('href')).toBe('/alert.ico');
    fixture.componentInstance.favicon.set(undefined);
    await fixture.whenStable();
    expect(link.getAttribute('href')).toBe('/alert.ico');
    fixture.destroy();
    expect(link.getAttribute('href')).toBe('/site.ico');
  });

  it('restores an empty favicon href and does nothing without a favicon link', async () => {
    const plain = TestBed.createComponent(FaviconHost);
    await plain.whenStable();
    plain.destroy();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();

    const link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
    const fixture = TestBed.createComponent(FaviconHost);
    await fixture.whenStable();
    expect(link.getAttribute('href')).toBe('/console.ico');
    link.remove();
    fixture.destroy();
    document.head.appendChild(link);
    expect(link.getAttribute('href')).toBe('/console.ico');
  });

  it('renders rail links with query params, targets and the default match, and untranslated labels', async () => {
    const fixture = TestBed.createComponent(FaviconHost);
    await TestBed.inject(Router).navigateByUrl('/search?tab=all');
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-console-layout') as HTMLElement;
    const [overview, docs, noop] = Array.from(root.querySelectorAll<HTMLElement>('.tx-console-rail__item'));
    expect(overview.getAttribute('href')).toBe('/search?tab=all');
    expect(overview.getAttribute('target')).toBe('_self');
    expect(overview.classList).toContain('tx-console-rail__item--active');
    expect(docs.getAttribute('target')).toBe('_blank');
    expect(docs.getAttribute('aria-current')).toBe('page');
    expect(noop.hasAttribute('aria-current')).toBe(false);
    noop.click();
    expect(root.querySelector('.tx-console-rail__label')?.textContent).toBe('Overview');
    expect(root.querySelector('span.tx-console-layout__brand')).not.toBeNull();
    expect(root.querySelectorAll('.tx-console-layout__crumb')).toHaveLength(0);
  });

  it('closes a lone panel after a pick in its nav or a navigation', async () => {
    const fixture = TestBed.createComponent(LonePanelHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-console-panel') as HTMLElement;
    const panel = fixture.debugElement.query(By.directive(TxConsolePanel)).componentInstance as TxConsolePanel;
    const toggle = root.querySelector('.tx-console-panel__toggle') as HTMLButtonElement;
    expect(root.getAttribute('data-responsive')).toBe('viewport');
    expect(toggle.textContent?.trim()).toBe('Menu');
    expect(root.querySelector('aside')?.hasAttribute('aria-label')).toBe(false);
    expect(root.querySelector('tx-app-footer')).toBeNull();

    const prevent = (event: Event) => event.preventDefault();
    root.addEventListener('click', prevent);
    toggle.click();
    (root.querySelector('.text') as HTMLElement).click();
    (root.querySelector('.page-link') as HTMLElement).click();
    expect(panel.expanded()).toBe(true);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(panel.expanded()).toBe(true);
    (root.querySelector('.link') as HTMLElement).click();
    expect(panel.expanded()).toBe(false);
    root.removeEventListener('click', prevent);

    panel.expanded.set(true);
    await TestBed.inject(Router).navigateByUrl('/elsewhere');
    expect(panel.expanded()).toBe(false);
    (root.querySelector('.tree') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(panel.expanded()).toBe(false);
  });

  it('shows no route crumbs without a router', async () => {
    TestBed.overrideProvider(Router, { useValue: null });
    const fixture = TestBed.createComponent(FaviconHost);
    fixture.componentInstance.items.set([{ label: 'Docs', icon: 'book', url: 'https://example.com/docs' }]);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-console-layout') as HTMLElement;
    expect(root.querySelectorAll('.tx-console-layout__crumb')).toHaveLength(0);
  });
});
