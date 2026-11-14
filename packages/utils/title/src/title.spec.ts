import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TxTitle, provideTxTitle } from './title';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

const routes = [
  { path: 'orders', title: 'orders', component: Page },
  { path: 'home', component: Page },
];

describe('provideTxTitle', () => {
  it('writes route titles as "Page · App" with a prefix', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideTxTitle({ appName: 'Console' })] });
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);
    await router.navigateByUrl('/orders');
    expect(title.getTitle()).toBe('orders · Console');
    TestBed.inject(TxTitle).setPrefix('(3)');
    expect(title.getTitle()).toBe('(3) orders · Console');
    await router.navigateByUrl('/home');
    expect(title.getTitle()).toBe('(3) Console');
  });

  it('leaves the title alone until a page or a prefix is set', () => {
    TestBed.configureTestingModule({ providers: [provideTxTitle({ appName: 'Console' })] });
    const title = TestBed.inject(Title);
    title.setTitle('Server title');
    TestBed.inject(TxTitle);
    expect(title.getTitle()).toBe('Server title');
  });

  it('translates titles and uses an own separator', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideTxTitle({ appName: 'Console', separator: ' — ', translate: (page) => of(page === 'orders' ? 'Замовлення' : page) })],
    });
    await TestBed.inject(Router).navigateByUrl('/orders');
    expect(TestBed.inject(Title).getTitle()).toBe('Замовлення — Console');
  });
  it('shows ready text as it is with translate: false', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideTxTitle({ appName: 'Console', translate: (page) => page.toUpperCase() })] });
    const txTitle = TestBed.inject(TxTitle);
    const title = TestBed.inject(Title);
    txTitle.setPage('Order 1042', { translate: false });
    expect(title.getTitle()).toBe('Order 1042 · Console');
    txTitle.setPage('orders', { translate: true });
    expect(title.getTitle()).toBe('ORDERS · Console');
    txTitle.setPage(undefined, { translate: false });
    expect(title.getTitle()).toBe('Console');
  });

  it('takes a plain translated string', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideTxTitle({ appName: 'Console', translate: (page) => page.toUpperCase() })] });
    await TestBed.inject(Router).navigateByUrl('/orders');
    expect(TestBed.inject(Title).getTitle()).toBe('ORDERS · Console');
  });
});
