import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TxToastTemplate } from './toast-template.directive';
import { TxToast } from './toast.component';
import { TxToastService } from './toast.service';
import { TxToastCloseReason } from './toast.types';

@Component({
  imports: [TxToast, TxToastTemplate],
  template: `
    <tx-toast id="main" [dt]="{ root: { width: '400px' } }" [pt]="{ title: { class: 'own-title' } }" />
    <tx-toast id="side" key="side" position="bottom-left" [max]="2">
      <ng-template txToastTemplate let-toast let-close="close">
        <span class="custom">{{ toast.text }}</span>
        <button class="custom-close" (click)="close()">x</button>
      </ng-template>
    </tx-toast>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

@Component({
  imports: [TxToast],
  template: `<div id="frame"><tx-toast id="inline" key="inline" inPlace /></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InPlaceHost {}

describe('TxToast', () => {
  let fixture: ComponentFixture<Host>;
  let toasts: TxToastService;
  let announce: ReturnType<typeof vi.fn>;
  const items = (outlet = '#main') => [...document.querySelectorAll(`${outlet} .tx-toast__item`)] as HTMLElement[];
  const render = async () => {
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    announce = vi.fn(() => Promise.resolve());
    TestBed.configureTestingModule({ providers: [{ provide: TxAnnouncer, useValue: { announce, clear: vi.fn() } }] });
    toasts = TestBed.inject(TxToastService);
    fixture = TestBed.createComponent(Host);
    await render();
  });

  afterEach(() => {
    toasts.clear();
    fixture.destroy();
    vi.useRealTimers();
  });

  it('moves its outlet to the end of the page', () => {
    expect(document.querySelector('#main')?.parentElement).toBe(document.body);
  });

  it('shows a toast in a named region, announces it and closes it after its life', async () => {
    const closed: TxToastCloseReason[] = [];
    toasts.success('Saved', { title: 'Profile' }).closed.subscribe((reason) => closed.push(reason));
    await render();
    const host = document.querySelector('#main') as HTMLElement;
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-label')).toBe('Notifications');
    expect(host.getAttribute('data-position')).toBe('bottom-center');
    expect(host.style.getPropertyValue('--tx-toast-width')).toBe('400px');
    const [item] = items();
    expect(item.querySelector('.tx-toast__pill')?.getAttribute('data-severity')).toBe('success');
    expect(item.getAttribute('data-front')).toBe('');
    expect(item.querySelector('.tx-toast__title')?.textContent).toBe('Profile');
    expect(item.querySelector('.tx-toast__title')?.classList).toContain('own-title');
    expect(item.querySelector('.tx-toast__title')?.classList).toContain('tx-toast__title--hidden');
    expect(item.querySelector('.tx-toast__text')?.textContent).toBe('Saved');
    expect(item.querySelector('tx-icon')?.getAttribute('data-icon')).toBe('check');
    expect(item.querySelector('.tx-toast__close')?.getAttribute('aria-label')).toBe('Close');
    expect(announce).toHaveBeenCalledWith('Profile. Saved', 'polite');

    vi.advanceTimersByTime(3000);
    await render();
    expect(toasts.toasts()).toEqual([]);
    expect(closed).toEqual(['timeout']);
  });

  it('announces errors assertively, stacks newest first and closes from the button', async () => {
    toasts.info('First');
    toasts.error('Second');
    await render();
    expect(announce).toHaveBeenLastCalledWith('Second', 'assertive');
    expect(items().map((item) => item.querySelector('.tx-toast__text')?.textContent)).toEqual(['Second', 'First']);
    (items()[0].querySelector('.tx-toast__close') as HTMLButtonElement).click();
    await render();
    expect(toasts.toasts().map((toast) => toast.text)).toEqual(['First']);
  });

  it('pauses its life while hovered or focused and keeps sticky toasts', async () => {
    toasts.warn('Paused', { life: 1000, showProgress: true });
    toasts.info('Stays', { sticky: true });
    await render();
    const item = items().find((element) => element.textContent?.includes('Paused')) as HTMLElement;
    vi.advanceTimersByTime(600);
    const host = document.querySelector('#main') as HTMLElement;
    host.dispatchEvent(new Event('mouseenter'));
    item.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await render();
    expect(item.querySelector('.tx-toast__progress')?.classList).toContain('tx-toast__progress--paused');
    vi.advanceTimersByTime(5000);
    host.dispatchEvent(new Event('mouseleave'));
    expect(host.hasAttribute('data-expanded')).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(toasts.toasts().length).toBe(2);
    item.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    vi.advanceTimersByTime(399);
    expect(toasts.toasts().length).toBe(2);
    vi.advanceTimersByTime(1);
    expect(toasts.toasts().map((toast) => toast.text)).toEqual(['Stays']);
  });

  it('turns a loading toast into a result and runs actions', async () => {
    const ref = toasts.loading('Exporting');
    await render();
    let [item] = items();
    expect(item.querySelector('tx-progress-spinner')).not.toBeNull();
    expect(item.querySelector('.tx-toast__pill')?.getAttribute('aria-busy')).toBe('true');
    expect(item.querySelector('.tx-toast__close')).toBeNull();
    vi.advanceTimersByTime(60000);
    expect(toasts.toasts().length).toBe(1);

    ref.update({ severity: 'success', text: 'Exported', actions: [{ label: 'Open', run: () => opened.push(ref.id) }] });
    await render();
    [item] = items();
    expect(item.querySelector('tx-progress-spinner')).toBeNull();
    expect(item.querySelector('.tx-toast__pill')?.getAttribute('data-severity')).toBe('success');
    expect(announce).toHaveBeenLastCalledWith('Exported', 'polite');
    const opened: number[] = [];
    (item.querySelector('.tx-toast__actions button') as HTMLButtonElement).click();
    await render();
    expect(opened).toEqual([ref.id]);
    expect(toasts.toasts()).toEqual([]);
  });

  it('routes toasts by key, caps them and renders a custom template', async () => {
    toasts.info('One', { key: 'side' });
    toasts.info('Two', { key: 'side' });
    toasts.info('Three', { key: 'side' });
    await render();
    expect(items()).toEqual([]);
    const side = items('#side');
    expect(side.map((item) => item.querySelector('.custom')?.textContent)).toEqual(['Three', 'Two', 'One']);
    expect(side.map((item) => item.hasAttribute('data-visible'))).toEqual([true, true, false]);
    expect(side[2].getAttribute('aria-hidden')).toBe('true');
    (side[0].querySelector('.custom-close') as HTMLButtonElement).click();
    await render();
    expect(toasts.toasts().map((toast) => toast.text)).toEqual(['One', 'Two']);
    toasts.clear('side');
    expect(toasts.toasts()).toEqual([]);
  });

  it('keeps an in-place outlet where it is declared and mounts without animation frames', async () => {
    const view = document.defaultView as Window;
    const frame = Object.getOwnPropertyDescriptor(view, 'requestAnimationFrame');
    Object.defineProperty(view, 'requestAnimationFrame', { configurable: true, writable: true, value: undefined });
    const inPlace = TestBed.createComponent(InPlaceHost);
    inPlace.detectChanges();
    await Promise.resolve();
    inPlace.detectChanges();
    expect(document.querySelector('#inline')?.parentElement?.id).toBe('frame');
    toasts.info('Here', { key: 'inline' });
    inPlace.detectChanges();
    const [item] = items('#inline');
    expect(item.hasAttribute('data-mounted')).toBe(false);
    vi.advanceTimersByTime(0);
    inPlace.detectChanges();
    expect(item.hasAttribute('data-mounted')).toBe(true);
    if (frame) {
      Object.defineProperty(view, 'requestAnimationFrame', frame);
    } else {
      Reflect.deleteProperty(view, 'requestAnimationFrame');
    }
    inPlace.destroy();
  });

  it('hides the icon when turned off or not registered', async () => {
    toasts.info('No icon', { icon: false });
    toasts.info('Unknown icon', { icon: 'not-registered' });
    toasts.info('Own icon', { icon: 'check' });
    await render();
    expect(items().map((item) => item.querySelector('tx-icon:not(.tx-toast__close tx-icon)')?.getAttribute('data-icon') ?? null)).toEqual(['check', null, null]);
  });

  it('stays expanded while focus moves inside the outlet', async () => {
    toasts.info('Focus', { actions: [{ label: 'Undo', keepOpen: true }] });
    await render();
    const host = document.querySelector('#main') as HTMLElement;
    const [item] = items();
    const close = item.querySelector('.tx-toast__close') as HTMLButtonElement;
    item.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    item.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: close }));
    await render();
    expect(host.hasAttribute('data-expanded')).toBe(true);
    vi.advanceTimersByTime(10000);
    expect(toasts.toasts().length).toBe(1);
    (item.querySelector('.tx-toast__action') as HTMLButtonElement).click();
    expect(toasts.toasts().length).toBe(1);
  });

  it('closes a toast swiped far or fast enough', async () => {
    const pointer = (target: Element, type: string, init: MouseEventInit = {}) => target.dispatchEvent(new MouseEvent(type, { bubbles: true, button: 0, ...init }));
    toasts.info('Swipe me', { sticky: true });
    toasts.loading('Busy');
    await render();
    const [busy, swipe] = items();
    expect(busy.textContent).toContain('Busy');

    pointer(busy, 'pointerdown', { clientX: 0 });
    pointer(busy, 'pointermove', { clientX: 80 });
    pointer(busy, 'pointerup');
    expect(toasts.toasts().length).toBe(2);

    pointer(swipe, 'pointerdown', { button: 2 });
    pointer(swipe.querySelector('.tx-toast__close') as HTMLElement, 'pointerdown');
    pointer(swipe, 'pointermove', { clientX: 80 });
    pointer(swipe, 'pointerup');
    expect(toasts.toasts().length).toBe(2);

    pointer(swipe, 'pointerdown', { clientX: 10, clientY: 10 });
    pointer(swipe, 'pointermove', { clientX: 11, clientY: 12 });
    await render();
    expect(swipe.hasAttribute('data-swiping')).toBe(false);
    pointer(swipe, 'pointerup');
    expect(toasts.toasts().length).toBe(2);

    pointer(swipe, 'pointerdown', { clientX: 10, clientY: 10 });
    pointer(swipe, 'pointermove', { clientX: 12, clientY: 30 });
    await render();
    expect(swipe.hasAttribute('data-swiping')).toBe(true);
    expect(swipe.style.getPropertyValue('--_swipe-y')).toBe('20px');
    vi.advanceTimersByTime(1000);
    pointer(swipe, 'pointercancel');
    await render();
    expect(swipe.hasAttribute('data-swiping')).toBe(false);
    expect(toasts.toasts().length).toBe(2);

    pointer(swipe, 'pointerdown', { clientX: 10, clientY: 10 });
    pointer(swipe, 'pointermove', { clientX: 70, clientY: 15 });
    await render();
    expect(swipe.style.getPropertyValue('--_swipe-x')).toBe('60px');
    vi.advanceTimersByTime(2000);
    pointer(swipe, 'pointerup');
    expect(toasts.toasts().map((toast) => toast.text)).toEqual(['Busy']);

    toasts.info('Flick', { sticky: true });
    await render();
    const flick = items()[0];
    pointer(flick, 'pointerdown', { clientX: 10, clientY: 10 });
    pointer(flick, 'pointermove', { clientX: 30, clientY: 10 });
    pointer(flick, 'pointerup');
    expect(toasts.toasts().map((toast) => toast.text)).toEqual(['Busy']);
  });

  it('ignores unknown ids and pauses nested hovers once', () => {
    const closed: TxToastCloseReason[] = [];
    const ref = toasts.show({ text: 'Plain', life: 1000 });
    ref.closed.subscribe((reason) => closed.push(reason));
    expect(toasts.toasts()[0].severity).toBe('info');
    toasts.close(999);
    toasts.update(999, { text: 'x' });
    toasts.run(999, { label: 'x' });
    toasts.pause(999);
    toasts.resume(999);
    toasts.resume(ref.id);
    toasts.clear('other');
    expect(toasts.toasts().length).toBe(1);

    toasts.pause(ref.id);
    toasts.pause(ref.id);
    expect(toasts.toasts()[0].paused).toBe(true);
    toasts.resume(ref.id);
    expect(toasts.toasts()[0].paused).toBe(true);
    ref.update({ title: undefined });
    vi.advanceTimersByTime(5000);
    expect(toasts.toasts().length).toBe(1);
    toasts.resume(ref.id);
    expect(toasts.toasts()[0].paused).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(toasts.toasts()).toEqual([]);
    expect(closed).toEqual(['timeout']);
  });

  it('announces only changed text, keeps loading when asked and closes from its ref', () => {
    const ref = toasts.loading('Working', { life: 0 });
    announce.mockClear();
    ref.update({ severity: 'warn', loading: true });
    expect(toasts.toasts()[0].loading).toBe(true);
    expect(announce).not.toHaveBeenCalled();
    ref.update({ loading: false, closable: true });
    vi.advanceTimersByTime(10000);
    expect(toasts.toasts().length).toBe(1);
    const closed: TxToastCloseReason[] = [];
    ref.closed.subscribe((reason) => closed.push(reason));
    ref.close();
    expect(closed).toEqual(['api']);

    toasts.show({ severity: 'secondary', sticky: true });
    expect(announce).not.toHaveBeenCalled();
    toasts.run(toasts.toasts()[0].id, { label: 'Done' });
    expect(toasts.toasts()).toEqual([]);
  });
});
