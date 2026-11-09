import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
});
