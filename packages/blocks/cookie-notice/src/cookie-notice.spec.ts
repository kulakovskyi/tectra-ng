import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TxCookieNotice } from './cookie-notice.component';

@Component({
  imports: [TxCookieNotice],
  template: `<tx-cookie-notice cookieName="test-notice" [link]="['/privacy']" [maxAgeDays]="30" (dismissed)="dismissals = dismissals + 1" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly notice = viewChild.required(TxCookieNotice);
  dismissals = 0;
}

describe('TxCookieNotice', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  afterEach(() => {
    document.cookie = 'test-notice=; max-age=0; path=/';
  });

  it('shows the notice until it is dismissed and remembers that in a cookie', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-cookie-notice') as HTMLElement;
    const panel = root.querySelector('[role="region"]') as HTMLElement;
    expect(panel.getAttribute('aria-label')).toBe('Cookie notice');
    expect(panel.querySelector('.tx-cookie-notice__title')?.textContent?.trim()).toBe('Only essential cookies');
    expect(panel.querySelector('.tx-cookie-notice__link')?.getAttribute('href')).toBe('/privacy');
    expect(panel.querySelector('tx-icon')?.getAttribute('data-icon')).toBe('shield');

    (panel.querySelector('.tx-cookie-notice__accept') as HTMLButtonElement).click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();
    expect(fixture.componentInstance.dismissals).toBe(1);
    expect(document.cookie).toContain('test-notice=1');
    expect(root.querySelector('[role="region"]')).toBeNull();

    const again = TestBed.createComponent(Host);
    await again.whenStable();
    expect(again.nativeElement.querySelector('[role="region"]')).toBeNull();
    again.componentInstance.notice().show();
    await again.whenStable();
    expect(again.nativeElement.querySelector('[role="region"]')).not.toBeNull();
  });
});

@Component({
  imports: [TxCookieNotice],
  template: `<tx-cookie-notice cookieName="test-shared" sharedDomain="example.com" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SharedHost {
  readonly notice = viewChild.required(TxCookieNotice);
}

describe('TxCookieNotice on another host', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  afterEach(() => {
    document.cookie = 'test-shared=; max-age=0; path=/';
  });

  it('keeps the cookie on the current host when it is outside the shared domain', async () => {
    const fixture = TestBed.createComponent(SharedHost);
    await fixture.whenStable();
    const writes: string[] = [];
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') as PropertyDescriptor;
    vi.spyOn(document, 'cookie', 'set').mockImplementation((value: string) => {
      writes.push(value);
      descriptor.set?.call(document, value);
    });
    fixture.componentInstance.notice().dismiss();
    vi.restoreAllMocks();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatch(/^test-shared=1; max-age=\d+; path=\/; samesite=lax$/);
    expect(document.cookie).toContain('test-shared=1');
  });
});

describe('TxCookieNotice with no router provided', () => {
  afterEach(() => {
    document.cookie = 'test-notice=; max-age=0; path=/';
  });

  it('renders without a router link instead of failing', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-cookie-notice') as HTMLElement;
    expect(root.querySelector('[role="region"]')).not.toBeNull();
    expect(root.querySelector('.tx-cookie-notice__link')).toBeNull();
  });
});
