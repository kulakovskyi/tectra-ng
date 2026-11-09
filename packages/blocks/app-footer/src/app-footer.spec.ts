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
