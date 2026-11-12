import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TxPublicHeaderBrand } from './public-header-brand.directive';
import { TxPublicHeader } from './public-header.component';

@Component({
  imports: [TxPublicHeader],
  template: `
    <tx-public-header brand="Northwind" logo="/logo.svg" [preferences]="preferences()" [pt]="{ toggle: { class: 'own-toggle' } }">
      <nav txPublicHeaderNav aria-label="Main">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
      </nav>
      <div txPublicHeaderActions>
        <button type="button" class="sign-in">Sign in</button>
      </div>
    </tx-public-header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly preferences = signal(true);
}

@Component({
  imports: [TxPublicHeader, TxPublicHeaderBrand],
  template: `<tx-public-header brand="Northwind" logo="/logo.svg"><span txPublicHeaderBrand class="own-logo">N</span></tx-public-header>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BrandHost {}

describe('TxPublicHeader', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('renders the brand, the nav, the preferences and the actions', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-public-header') as HTMLElement;
    const brand = root.querySelector('.tx-public-header__brand') as HTMLAnchorElement;
    expect(brand.getAttribute('href')).toBe('/');
    expect(brand.textContent?.trim()).toBe('Northwind');
    expect(brand.querySelector('img')?.getAttribute('src')).toBe('/logo.svg');
    expect(root.querySelector('.tx-public-header__nav [txPublicHeaderNav] a')?.textContent).toBe('Features');
    expect(root.querySelector('.tx-public-header__actions .sign-in')).not.toBeNull();
    expect(root.querySelector('tx-topbar-preferences')).not.toBeNull();
    fixture.componentInstance.preferences.set(false);
    await fixture.whenStable();
    expect(root.querySelector('tx-topbar-preferences')).toBeNull();
  });

  it('opens the menu with the burger and closes it on a link or Escape', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-public-header') as HTMLElement;
    const toggle = root.querySelector('.tx-public-header__toggle') as HTMLButtonElement;
    const panel = root.querySelector('.tx-public-header__panel') as HTMLElement;
    expect(toggle.classList).toContain('own-toggle');
    expect(toggle.getAttribute('aria-controls')).toBe(panel.id);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Open menu');

    toggle.click();
    await fixture.whenStable();
    expect(root.classList).toContain('tx-public-header--open');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Close menu');
    (root.querySelector('[txPublicHeaderNav] a') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(root.classList).not.toContain('tx-public-header--open');

    toggle.click();
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(root.classList).not.toContain('tx-public-header--open');
    expect(document.activeElement).toBe(toggle);
  });

  it('takes own brand content and keeps the brand as the link name', async () => {
    const fixture = TestBed.createComponent(BrandHost);
    await fixture.whenStable();
    const brand = fixture.nativeElement.querySelector('.tx-public-header__brand') as HTMLAnchorElement;
    expect(brand.querySelector('.own-logo')?.textContent).toBe('N');
    expect(brand.querySelector('img')).toBeNull();
    expect(brand.getAttribute('aria-label')).toBe('Northwind');
  });
});

@Component({
  imports: [TxPublicHeader],
  template: `
    <tx-public-header brand="Northwind" [homeLink]="homeLink()" [responsive]="responsive()">
      <nav txPublicHeaderNav aria-label="Main">
        <a href="#features">Features</a>
        <span class="note">Note</span>
      </nav>
    </tx-public-header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CompactHost {
  readonly homeLink = signal<string | readonly unknown[]>('/');
  readonly responsive = signal<'viewport' | 'container'>('viewport');
}

type ResizeCallback = (entries: { contentRect: { width: number } }[]) => void;

function mockMedia(state: { compact: boolean; reduced: boolean }) {
  const listeners: (() => void)[] = [];
  const removed: (() => void)[] = [];
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    get matches() {
      return query.includes('reduce') ? state.reduced : state.compact;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
    removeEventListener: (_type: string, listener: () => void) => removed.push(listener),
  })) as unknown as typeof window.matchMedia;
  return {
    listeners,
    removed,
    change: () => listeners.forEach((listener) => listener()),
    restore: () => {
      window.matchMedia = original;
    },
  };
}

describe('TxPublicHeader compact menu', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  afterEach(() => vi.useRealTimers());

  async function setup(prepare?: (host: CompactHost) => void) {
    const fixture = TestBed.createComponent(CompactHost);
    prepare?.(fixture.componentInstance);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-public-header') as HTMLElement;
    const header = fixture.debugElement.query(By.directive(TxPublicHeader)).componentInstance as TxPublicHeader;
    return { fixture, root, header };
  }

  it('links the brand with a plain href without a router', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: ActivatedRoute, useValue: null }] });
    const { fixture, root } = await setup();
    const brand = () => root.querySelector('.tx-public-header__brand') as HTMLAnchorElement;
    expect(brand().getAttribute('href')).toBe('/');
    expect(brand().hasAttribute('aria-label')).toBe(false);
    fixture.componentInstance.homeLink.set(['docs', 'start']);
    await fixture.whenStable();
    expect(brand().getAttribute('href')).toBe('/docs/start');
  });

  it('animates the compact menu closed until the animation or the fallback ends', async () => {
    const state = { compact: true, reduced: false };
    const media = mockMedia(state);
    try {
      const { fixture, root, header } = await setup();
      const toggle = root.querySelector('.tx-public-header__toggle') as HTMLButtonElement;
      const panel = root.querySelector('.tx-public-header__panel') as HTMLElement;
      expect(header.compact()).toBe(true);
      fixture.detectChanges();
      expect(root.querySelector('tx-topbar-preferences')?.getAttribute('data-layout')).toBe('stacked');

      toggle.click();
      toggle.click();
      fixture.detectChanges();
      expect(header.open()).toBe(false);
      expect(root.classList).toContain('tx-public-header--closing');
      panel.querySelector('a')?.dispatchEvent(new Event('animationend', { bubbles: true }));
      fixture.detectChanges();
      expect(root.classList).toContain('tx-public-header--closing');
      panel.dispatchEvent(new Event('animationend'));
      fixture.detectChanges();
      expect(root.classList).not.toContain('tx-public-header--closing');
      panel.dispatchEvent(new Event('animationend'));
      expect(root.classList).not.toContain('tx-public-header--closing');

      vi.useFakeTimers();
      header.toggle();
      header.close();
      header.close();
      fixture.detectChanges();
      expect(root.classList).toContain('tx-public-header--closing');
      header.toggle();
      fixture.detectChanges();
      expect(root.classList).not.toContain('tx-public-header--closing');
      header.close();
      vi.advanceTimersByTime(600);
      fixture.detectChanges();
      expect(root.classList).not.toContain('tx-public-header--closing');

      state.reduced = true;
      header.toggle();
      header.close();
      fixture.detectChanges();
      expect(root.classList).not.toContain('tx-public-header--closing');
    } finally {
      media.restore();
    }
  });

  it('keeps the menu open for clicks on plain content and closes it once the screen grows', async () => {
    const state = { compact: true, reduced: true };
    const media = mockMedia(state);
    try {
      const { fixture, root, header } = await setup();
      header.toggle();
      (root.querySelector('.note') as HTMLElement).click();
      (root.querySelector('.tx-public-header__preferences button') as HTMLElement | null)?.click();
      root.querySelector('.tx-public-header__preferences')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(header.open()).toBe(true);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(header.open()).toBe(false);

      header.toggle();
      state.compact = false;
      media.change();
      expect(header.compact()).toBe(false);
      expect(header.open()).toBe(false);
      fixture.destroy();
      expect(media.removed).toEqual(media.listeners);
    } finally {
      media.restore();
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
      const { fixture, root, header } = await setup((host) => host.responsive.set('container'));
      expect(root.getAttribute('data-responsive')).toBe('container');
      expect(observed).toEqual([root]);
      callback([{ contentRect: { width: 500 } }]);
      expect(header.compact()).toBe(true);
      header.toggle();
      callback([{ contentRect: { width: 1200 } }]);
      expect(header.compact()).toBe(false);
      expect(header.open()).toBe(false);
      fixture.destroy();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      delete (window as { ResizeObserver?: unknown }).ResizeObserver;
    }
  });
});

describe('TxPublicHeader with no router provided', () => {
  it('links the brand with a plain href instead of a router link', async () => {
    const fixture = TestBed.createComponent(CompactHost);
    await fixture.whenStable();
    const brand = fixture.nativeElement.querySelector('.tx-public-header__brand') as HTMLAnchorElement;
    expect(brand.getAttribute('href')).toBe('/');
  });
});
