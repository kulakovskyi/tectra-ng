import { Location, ViewportScroller } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component, DOCUMENT, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTxScrolling } from './scrolling';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class Page {}

const routes = [
  { path: 'list', component: Page },
  { path: 'detail/:id', component: Page },
];

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

function setup() {
  let position: [number, number] = [0, 0];
  const scroller = {
    getScrollPosition: vi.fn(() => position),
    scrollToPosition: vi.fn((next: [number, number]) => (position = next)),
    setHistoryScrollRestoration: vi.fn(),
  };
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), provideLocationMocks(), provideTxScrolling(), { provide: ViewportScroller, useValue: scroller }],
  });
  const router = TestBed.inject(Router);
  router.setUpLocationChangeListener();
  const scrollTo = (next: [number, number]) => {
    position = next;
  };
  return { router, scroller, scrollTo, location: TestBed.inject(Location) };
}

describe('provideTxScrolling', () => {
  it('scrolls to the top only when the path changes', async () => {
    const { router, scroller, scrollTo } = setup();
    expect(scroller.setHistoryScrollRestoration).toHaveBeenCalledWith('manual');
    await router.navigateByUrl('/list');
    await settle();
    expect(scroller.scrollToPosition).not.toHaveBeenCalled();

    scrollTo([0, 600]);
    await router.navigateByUrl('/list?page=2&sort=name');
    await settle();
    expect(scroller.scrollToPosition).not.toHaveBeenCalled();

    await router.navigateByUrl('/list?page=2#totals');
    await settle();
    await router.navigateByUrl('/detail/7#comments');
    await settle();
    expect(scroller.scrollToPosition).not.toHaveBeenCalled();

    await router.navigateByUrl('/detail/8');
    await settle();
    expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
  });

  it('restores the saved position on back and forward', async () => {
    const { router, scroller, scrollTo, location } = setup();
    await router.navigateByUrl('/list');
    scrollTo([0, 900]);
    await router.navigateByUrl('/detail/1');
    await settle();
    expect(scroller.scrollToPosition).toHaveBeenLastCalledWith([0, 0]);
    scrollTo([0, 300]);

    location.back();
    await settle();
    expect(scroller.scrollToPosition).toHaveBeenLastCalledWith([0, 900]);

    location.forward();
    await settle();
    expect(scroller.scrollToPosition).toHaveBeenLastCalledWith([0, 300]);
  });

  it('keeps only the last scroll of quick navigations and stops with the app', async () => {
    const { router, scroller } = setup();
    await router.navigateByUrl('/list');
    await router.navigateByUrl('/detail/1');
    await router.navigateByUrl('/detail/2');
    await settle();
    expect(scroller.scrollToPosition).toHaveBeenCalledTimes(1);

    await router.navigateByUrl('/list');
    TestBed.resetTestingModule();
    await settle();
    expect(scroller.scrollToPosition).toHaveBeenCalledTimes(1);
  });
});

describe('provideTxScrolling without a window', () => {
  it('does nothing', async () => {
    const scroller = { getScrollPosition: vi.fn(), scrollToPosition: vi.fn(), setHistoryScrollRestoration: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideTxScrolling(),
        { provide: ViewportScroller, useValue: scroller },
        { provide: DOCUMENT, useValue: document.implementation.createHTMLDocument('') },
      ],
    });
    TestBed.inject(EnvironmentInjector);
    expect(scroller.setHistoryScrollRestoration).not.toHaveBeenCalled();
  });
});
