import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TxGoBack } from './go-back.directive';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

@Component({
  imports: [TxGoBack],
  template: `<button type="button" txGoBack="/orders" (navigated)="last = $event">Back</button><span class="crumb" [txGoBack]="['/orders']">Orders</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BackHost {
  last = '';
}

async function setup(urls: string[]) {
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Page }])] });
  const router = TestBed.inject(Router);
  for (const url of urls) {
    await router.navigateByUrl(url);
  }
  const fixture = TestBed.createComponent(BackHost);
  fixture.detectChanges();
  return { router, fixture, root: fixture.nativeElement as HTMLElement };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

describe('txGoBack', () => {
  it('goes back in history after an in-app navigation', async () => {
    const { fixture, root } = await setup(['/orders', '/orders/42']);
    const back = vi.spyOn(TestBed.inject(Location), 'back');
    root.querySelector('button')?.click();
    expect(back).toHaveBeenCalled();
    expect(fixture.componentInstance.last).toBe('back');
  });

  it('opens the fallback when the page was opened directly', async () => {
    const { router, fixture, root } = await setup(['/orders/42']);
    vi.spyOn(TestBed.inject(Location), 'getState').mockReturnValue({ navigationId: 1 });
    root.querySelector('button')?.click();
    await settle();
    expect(router.url).toBe('/orders');
    expect(fixture.componentInstance.last).toBe('fallback');
  });

  it('makes a plain element a keyboard button', async () => {
    const { router, root } = await setup(['/orders/42']);
    vi.spyOn(TestBed.inject(Location), 'getState').mockReturnValue(null);
    const crumb = root.querySelector('.crumb') as HTMLElement;
    expect(crumb.getAttribute('role')).toBe('button');
    expect(crumb.getAttribute('tabindex')).toBe('0');
    expect(root.querySelector('button')?.hasAttribute('role')).toBe(false);
    await router.navigateByUrl('/elsewhere');
    crumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
    expect(router.url).toBe('/orders');
  });
});
