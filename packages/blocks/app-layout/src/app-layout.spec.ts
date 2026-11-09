import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxAppLayout } from './app-layout.component';

@Component({
  imports: [TxAppLayout],
  template: `
    <tx-app-layout
      title="Reports"
      logo="/logo.svg"
      stateKey="tx-spec-app-menu"
      [sidebar]="sidebar()"
      [backdrop]="backdrop()"
      backdropVariant="accent"
      [model]="model"
      [(anchored)]="anchored"
      [dt]="{ sidebar: { width: '240px' } }"
    >
      <button txAppTopbar type="button" class="bell">Bell</button>
      <p class="page">Page</p>
      <footer txAppFooter class="foot">Footer</footer>
    </tx-app-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly sidebar = signal(true);
  readonly backdrop = signal(true);
  readonly anchored = signal(true);
  readonly model: TxPanelMenuItem[] = [{ label: 'Main', items: [{ label: 'Dashboard', icon: 'home' }] }];
}

describe('TxAppLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('renders the sidebar with the brand and menu, the top bar slot, the page and the footer', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-app-layout') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(true);
    expect(root.getAttribute('data-responsive')).toBe('viewport');
    expect(root.style.getPropertyValue('--tx-app-layout-sidebar-width')).toBe('240px');
    expect(root.querySelector('.tx-app-layout__backdrop')?.getAttribute('data-variant')).toBe('accent');
    const aside = root.querySelector('aside') as HTMLElement;
    expect(aside.getAttribute('aria-label')).toBe('Menu');
    expect(aside.querySelector('.tx-app-layout__brand')?.getAttribute('href')).toBe('/');
    expect(aside.querySelector('.tx-app-layout__brand')?.getAttribute('aria-label')).toBe('Reports');
    expect(aside.querySelector('.tx-app-layout__name')?.textContent?.trim()).toBe('Reports');
    expect(aside.querySelector('tx-panel-menu .tx-panel-menu__label')?.textContent?.trim()).toBe('Dashboard');
    expect(root.querySelector('.tx-app-layout__topbar-end .bell')).not.toBeNull();
    expect(root.querySelector('main .page')).not.toBeNull();
    expect(root.querySelector('.tx-app-layout__wrapper > .foot')).not.toBeNull();
    const button = root.querySelector('.tx-app-layout__menu-button') as HTMLButtonElement;
    expect(button.getAttribute('aria-controls')).toBe(aside.id);
  });

  it('pins and unpins the sidebar, folds the menu and keeps the choice', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-app-layout') as HTMLElement;
    const anchor = root.querySelector('.tx-app-layout__anchor') as HTMLButtonElement;
    const menu = root.querySelector('tx-panel-menu') as HTMLElement;
    expect(root.classList).toContain('tx-app-layout--anchored');
    expect(anchor.getAttribute('aria-pressed')).toBe('true');
    expect(anchor.getAttribute('aria-label')).toBe('Let the menu fold');
    expect(menu.classList).not.toContain('tx-panel-menu--collapsed');

    anchor.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.anchored()).toBe(false);
    expect(localStorage.getItem('tx-spec-app-menu')).toBe('false');
    root.querySelector('aside')?.dispatchEvent(new MouseEvent('mouseleave'));
    await fixture.whenStable();
    expect(root.classList).not.toContain('tx-app-layout--wide');
    expect(menu.classList).toContain('tx-panel-menu--collapsed');

    root.querySelector('aside')?.dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(menu.classList).not.toContain('tx-panel-menu--collapsed');
  });

  it('reads the stored choice and opens the mobile menu from the button', async () => {
    localStorage.setItem('tx-spec-app-menu', 'false');
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-app-layout') as HTMLElement;
    expect(fixture.componentInstance.anchored()).toBe(false);
    const button = root.querySelector('.tx-app-layout__menu-button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(root.classList).toContain('tx-app-layout--open');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    button.focus();
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(root.classList).not.toContain('tx-app-layout--open');
    (root.querySelector('.tx-app-layout__menu-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    (root.querySelector('.tx-app-layout__mask') as HTMLElement).click();
    await fixture.whenStable();
    expect(root.classList).not.toContain('tx-app-layout--open');
  });

  it('puts the brand into the top bar without the sidebar', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.sidebar.set(false);
    fixture.componentInstance.backdrop.set(false);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-app-layout') as HTMLElement;
    expect(root.classList).toContain('tx-app-layout--plain');
    expect(root.querySelector('aside')).toBeNull();
    expect(root.querySelector('.tx-app-layout__menu-button')).toBeNull();
    expect(root.querySelector('.tx-app-layout__backdrop')).toBeNull();
    expect(root.querySelector('.tx-app-layout__topbar .tx-app-layout__plain-brand .tx-app-layout__name')?.textContent?.trim()).toBe('Reports');
  });
});
