import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TxAppFooter } from './app-footer.component';
import { TxAppFooterLink, TxAppFooterVariant } from './app-footer.types';

@Component({
  imports: [TxAppFooter],
  template: `<tx-app-footer name="Acme" [year]="2026" [variant]="variant()" [links]="links()" [pt]="{ nav: { class: 'own-nav' } }" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly variant = signal<TxAppFooterVariant>('page');
  readonly links = signal<TxAppFooterLink[]>([
    { label: 'Privacy', routerLink: '/privacy' },
    { label: 'Status', url: 'https://example.com/status', target: '_blank' },
  ]);
}

describe('TxAppFooter', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('renders the copyright line and the legal links', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-app-footer') as HTMLElement;
    expect(root.querySelector('footer')).not.toBeNull();
    expect(root.querySelector('.tx-app-footer__copy')?.textContent?.trim()).toBe('© 2026 Acme');
    const nav = root.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Legal');
    expect(nav.classList).toContain('own-nav');
    const [privacy, status] = Array.from(nav.querySelectorAll('a'));
    expect(privacy.getAttribute('href')).toBe('/privacy');
    expect(status.getAttribute('href')).toBe('https://example.com/status');
    expect(status.getAttribute('target')).toBe('_blank');
    expect(root.getAttribute('data-variant')).toBe('page');
  });

  it('drops the navigation without links and reflects the variant', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.links.set([]);
    fixture.componentInstance.variant.set('console');
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-app-footer') as HTMLElement;
    expect(root.querySelector('nav')).toBeNull();
    expect(root.getAttribute('data-variant')).toBe('console');
  });
});

describe('TxAppFooter router link targets', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('opens a router link in the given target', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.links.set([
      { label: 'Terms', routerLink: '/terms', queryParams: { lang: 'en' }, target: '_blank' },
      { label: 'Privacy', routerLink: '/privacy' },
    ]);
    await fixture.whenStable();
    const [terms, privacy] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('nav a'));
    expect(terms.getAttribute('href')).toBe('/terms?lang=en');
    expect(terms.getAttribute('target')).toBe('_blank');
    expect(privacy.hasAttribute('target')).toBe(false);
  });
});

@Component({
  imports: [TxAppFooter],
  template: `<tx-app-footer name="Acme" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class YearHost {}

describe('TxAppFooter year', () => {
  it('shows the current year by default', async () => {
    const fixture = TestBed.createComponent(YearHost);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.tx-app-footer__copy')?.textContent?.trim()).toBe(`© ${new Date().getFullYear()} Acme`);
  });
});
