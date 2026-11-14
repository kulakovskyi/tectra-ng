import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
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
    expect(root.hasAttribute('title')).toBe(false);
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

@Component({
  imports: [TxAppLayout],
  template: `
    <tx-app-layout
      title="Reports"
      [stateKey]="stateKey()"
      [responsive]="responsive()"
      [homeLink]="homeLink()"
      [model]="model"
    >
      <p class="page">Page</p>
    </tx-app-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ResponsiveHost {
  readonly stateKey = signal<string | undefined>(undefined);
  readonly responsive = signal<'viewport' | 'container'>('viewport');
  readonly homeLink = signal<string | undefined>('/');
  readonly model: TxPanelMenuItem[] = [
    { label: 'Main', items: [{ label: 'Dashboard', icon: 'home', routerLink: '/dashboard' }] },
  ];
}

type ResizeCallback = (entries: { contentRect: { width: number } }[]) => void;

describe('TxAppLayout responsive behaviour', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: ResponsiveHost }])],
    });
  });
  afterEach(() => vi.restoreAllMocks());

  async function setup(prepare?: (host: ResponsiveHost) => void) {
    const fixture = TestBed.createComponent(ResponsiveHost);
    prepare?.(fixture.componentInstance);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-app-layout') as HTMLElement;
    const layout = fixture.debugElement.query(By.directive(TxAppLayout)).componentInstance as TxAppLayout;
    return { fixture, root, layout };
  }

  it('follows the viewport width, closes the mobile menu on a pick and stops listening on destroy', async () => {
    const listeners: (() => void)[] = [];
    const media = {
      matches: true,
      addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
      removeEventListener: vi.fn(),
    };
    const original = window.matchMedia;
    window.matchMedia = (() => media) as unknown as typeof window.matchMedia;
    try {
      const { fixture, root, layout } = await setup();
      expect(layout.mobile()).toBe(true);
      expect(root.querySelector('aside')?.hasAttribute('inert')).toBe(true);
      expect(root.classList).toContain('tx-app-layout--wide');

      layout.toggleMobile();
      await fixture.whenStable();
      expect(root.querySelector('aside')?.hasAttribute('inert')).toBe(false);
      (root.querySelector('.tx-app-layout__sidebar-header') as HTMLElement).click();
      (root.querySelector('.tx-app-layout__menu tx-panel-menu') as HTMLElement).click();
      expect(layout.mobileOpen()).toBe(true);
      (root.querySelector('.tx-app-layout__menu a[href]') as HTMLElement).click();
      expect(layout.mobileOpen()).toBe(false);

      layout.toggleMobile();
      media.matches = false;
      listeners.forEach((listener) => listener());
      expect(layout.mobile()).toBe(false);
      expect(layout.mobileOpen()).toBe(false);
      (root.querySelector('.tx-app-layout__menu a[href]') as HTMLElement).click();
      expect(layout.mobileOpen()).toBe(false);

      fixture.destroy();
      expect(media.removeEventListener).toHaveBeenCalledWith('change', listeners[0]);
    } finally {
      window.matchMedia = original;
    }
  });

  it('follows its own width when responsive is container', async () => {
    const observed: Element[] = [];
    const disconnect = vi.fn();
    let callback: ResizeCallback = () => undefined;
    (window as { ResizeObserver?: unknown }).ResizeObserver = class {
      constructor(next: ResizeCallback) {
        callback = next;
      }
      observe(element: Element) {
        observed.push(element);
      }
      disconnect() {
        disconnect();
      }
    };
    try {
      const { fixture, root, layout } = await setup((host) => host.responsive.set('container'));
      expect(root.getAttribute('data-responsive')).toBe('container');
      expect(observed).toEqual([root]);
      callback([{ contentRect: { width: 600 } }]);
      expect(layout.mobile()).toBe(true);
      layout.toggleMobile();
      callback([{ contentRect: { width: 1400 } }]);
      expect(layout.mobile()).toBe(false);
      expect(layout.mobileOpen()).toBe(false);
      fixture.destroy();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      delete (window as { ResizeObserver?: unknown }).ResizeObserver;
    }
  });

  it('widens a folded sidebar while the keyboard focus is inside', async () => {
    const { fixture, root, layout } = await setup();
    layout.toggleAnchored();
    const aside = root.querySelector('aside') as HTMLElement;
    aside.dispatchEvent(new MouseEvent('mouseleave'));
    await fixture.whenStable();
    expect(layout.expanded()).toBe(false);

    const anchor = root.querySelector('.tx-app-layout__anchor') as HTMLButtonElement;
    vi.spyOn(anchor, 'matches').mockImplementation((selector) => selector === ':focus-visible');
    anchor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(layout.expanded()).toBe(true);
    const link = root.querySelector('.tx-app-layout__brand') as HTMLElement;
    anchor.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: link }));
    expect(layout.expanded()).toBe(true);
    anchor.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    expect(layout.expanded()).toBe(false);

    anchor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    anchor.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(layout.expanded()).toBe(false);
    link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(layout.expanded()).toBe(false);
  });

  it('closes the mobile menu after a navigation and renders a plain brand without a home link', async () => {
    const { fixture, root, layout } = await setup((host) => host.homeLink.set(undefined));
    expect(root.querySelector('a.tx-app-layout__brand')).toBeNull();
    expect(root.querySelector('span.tx-app-layout__brand .tx-app-layout__name')?.textContent?.trim()).toBe('Reports');
    layout.toggleMobile();
    expect(layout.mobileOpen()).toBe(true);
    await TestBed.inject(Router).navigateByUrl('/orders');
    await fixture.whenStable();
    expect(layout.mobileOpen()).toBe(false);
  });

  it('keeps the pin choice only with a state key and survives a broken storage', async () => {
    const plain = await setup();
    plain.layout.toggleAnchored();
    expect(localStorage.length).toBe(0);
    plain.fixture.destroy();

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const broken = await setup((host) => host.stateKey.set('tx-spec-broken-menu'));
    expect(broken.layout.anchored()).toBe(true);
    broken.layout.toggleAnchored();
    expect(broken.layout.anchored()).toBe(false);
    broken.fixture.destroy();

    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('denied');
    });
    const denied = await setup((host) => host.stateKey.set('tx-spec-denied-menu'));
    expect(denied.layout.anchored()).toBe(true);
    denied.layout.toggleAnchored();
    expect(denied.layout.anchored()).toBe(false);
  });

  it('keeps the pin choice in memory when the window has no storage', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(null as unknown as Storage);
    const { layout } = await setup((host) => host.stateKey.set('tx-spec-missing-menu'));
    expect(layout.anchored()).toBe(true);
    layout.toggleAnchored();
    expect(layout.anchored()).toBe(false);
  });
});
