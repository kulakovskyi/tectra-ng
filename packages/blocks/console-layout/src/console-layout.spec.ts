import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
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
