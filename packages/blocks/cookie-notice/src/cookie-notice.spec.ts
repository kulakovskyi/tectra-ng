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
