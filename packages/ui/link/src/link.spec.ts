import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TxIconLink } from './icon-link.component';
import { TxLink } from './link.component';
import { TxLinkType } from './link.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

@Component({
  imports: [TxLink, TxIconLink],
  template: `
    <tx-link id="url" [link]="link()" [type]="type()" [maxLength]="12" highlight="docs" [copyable]="true" (copied)="copiedText = $event" />
    <tx-link id="router" link="Settings" [routerLink]="['/settings']" />
    <tx-icon-link id="nav" icon="pi-user" text="Profile" routerLink="/profile" />
    <tx-icon-link id="external" icon="book" text="Docs" href="https://docs.example.com" />
    <tx-icon-link id="action" icon="sign-out" text="Log out" />
    <tx-icon-link id="own-icon" icon="own-link-icon" text="Own" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly link = signal<string | null>('docs.example.com/guide');
  readonly type = signal<TxLinkType>('url');
  copiedText = '';
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxLink and TxIconLink', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const writeText = vi.fn(() => Promise.resolve());

  beforeEach(async () => {
    Object.assign(navigator, { clipboard: { writeText } });
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'profile', component: Page }, { path: 'settings', component: Page }])] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('opens web links in a new tab, shortens and highlights the text', () => {
    const anchor = el('#url a') as HTMLAnchorElement;
    expect(anchor.getAttribute('href')).toBe('https://docs.example.com/guide');
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toBe('noopener noreferrer');
    expect(anchor.title).toBe('docs.example.com/guide');
    expect(el('#url .tx-link__text').textContent).toBe('docs.example…');
    expect(el('#url mark').textContent).toBe('docs');
    expect(el('#url .tx-link__hint').textContent).toBe('(opens in a new tab)');
    expect(el('#url .tx-link__external')).not.toBeNull();
  });

  it('builds mailto and tel links that stay in the tab', async () => {
    fixture.componentInstance.type.set('email');
    fixture.componentInstance.link.set('ann@example.com');
    await fixture.whenStable();
    expect(el('#url a').getAttribute('href')).toBe('mailto:ann@example.com');
    expect(el('#url a').hasAttribute('target')).toBe(false);
    expect(el('#url .tx-link__external')).toBeNull();
    fixture.componentInstance.type.set('phone');
    fixture.componentInstance.link.set('+380 44 123-45-67');
    await fixture.whenStable();
    expect(el('#url a').getAttribute('href')).toBe('tel:+380441234567');
  });

  it('copies the link', async () => {
    const button = el('#url .tx-link__copy') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Copy link');
    button.click();
    await fixture.whenStable();
    expect(writeText).toHaveBeenCalledWith('docs.example.com/guide');
    expect(fixture.componentInstance.copiedText).toBe('docs.example.com/guide');
    expect(button.getAttribute('aria-label')).toBe('Copied');
  });

  it('uses the router for routerLink', () => {
    expect(el('#router a').getAttribute('href')).toBe('/settings');
    expect(el('#router a').hasAttribute('target')).toBe(false);
  });

  it('renders icon links as router links, external links or buttons', async () => {
    expect(el('#nav a').getAttribute('href')).toBe('/profile');
    expect(el('#nav tx-icon').getAttribute('data-icon')).toBe('pi-user');
    (el('#nav a') as HTMLAnchorElement).click();
    await fixture.whenStable();
    expect(el('#nav a').classList).toContain('tx-icon-link__anchor--active');
    expect(el('#nav a').getAttribute('aria-current')).toBe('page');
    expect(el('#external a').getAttribute('rel')).toBe('noopener noreferrer');
    expect(el('#external a').getAttribute('target')).toBe('_blank');
    expect(el('#action button').textContent).toContain('Log out');
  });

  it('keeps absolute and local addresses, treats a missing link as empty and draws an unknown icon as a class', async () => {
    fixture.componentInstance.link.set('/local/page');
    await fixture.whenStable();
    expect(el('#url a').getAttribute('href')).toBe('/local/page');
    fixture.componentInstance.link.set('http://example.com');
    await fixture.whenStable();
    expect(el('#url a').getAttribute('href')).toBe('http://example.com');
    fixture.componentInstance.link.set(null);
    await fixture.whenStable();
    expect(el('#url .tx-link__text').textContent).toBe('');
    expect(el('#own-icon span.own-link-icon')).not.toBeNull();
  });

  it('restarts the check when copied again and resets it after a while', async () => {
    vi.useFakeTimers();
    const button = el('#url .tx-link__copy') as HTMLButtonElement;
    button.click();
    vi.advanceTimersByTime(1000);
    button.click();
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Copied');
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Copy link');
    vi.useRealTimers();
  });
});

