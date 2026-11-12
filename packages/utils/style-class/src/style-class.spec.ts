import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxStyleClass } from './style-class.directive';

@Component({
  imports: [TxStyleClass],
  template: `
    <button type="button" class="open" txStyleClass enterFromClass="hidden" leaveToClass="hidden" hideOnOutsideClick hideOnEscape>Menu</button>
    <div class="panel hidden">Panel</div>
    <button type="button" class="dark" txStyleClass=".page" toggleClass="dark-mode">Theme</button>
    <section class="page"><p>Text</p></section>
    <button type="button" class="animated" txStyleClass="@next" enterFromClass="hidden" enterActiveClass="fade-in" leaveActiveClass="fade-out" leaveToClass="hidden">Info</button>
    <div class="info hidden">Info</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StyleHost {}

@Component({
  imports: [TxStyleClass],
  template: `
    <span class="before">Before</span>
    <button type="button" class="prev" txStyleClass="@prev" toggleClass="on">Prev</button>
    <div class="parent"><button type="button" class="to-parent" txStyleClass="@parent" toggleClass="on">Parent</button></div>
    <div class="grand"><div><button type="button" class="to-grand" txStyleClass="@grandparent" toggleClass="on">Grand</button></div></div>
    <button type="button" class="pinned" txStyleClass leaveFromClass="leaving" hideOnResize hideOnEscape>Pinned</button>
    <div class="pinned-panel" style="position: fixed">Pinned panel</div>
    <button type="button" class="missing" txStyleClass=".nowhere">Missing</button>
    <button type="button" class="top" txStyleClass="@grandparent" toggleClass="on">Top</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TargetHost {}

describe('txStyleClass', () => {
  function setup() {
    const fixture = TestBed.createComponent(StyleHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const get = (selector: string) => root.querySelector(selector) as HTMLElement;
    return { fixture, root, get };
  }

  afterEach(() => document.body.replaceChildren());

  it('shows and hides the next element with enter and leave classes', () => {
    const { fixture, get } = setup();
    get('.open').click();
    fixture.detectChanges();
    expect(get('.panel').classList.contains('hidden')).toBe(false);
    expect(get('.open').getAttribute('aria-expanded')).toBe('true');
    get('.open').click();
    fixture.detectChanges();
    expect(get('.panel').classList.contains('hidden')).toBe(true);
    expect(get('.open').getAttribute('aria-expanded')).toBe('false');
  });

  it('hides on an outside click and on Escape', () => {
    const { get } = setup();
    get('.open').click();
    document.body.click();
    expect(get('.panel').classList.contains('hidden')).toBe(true);
    get('.open').click();
    get('.panel').click();
    expect(get('.panel').classList.contains('hidden')).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(get('.panel').classList.contains('hidden')).toBe(true);
  });

  it('toggles a class on a target found by a selector', () => {
    const { get } = setup();
    get('.dark').click();
    expect(get('.page').classList.contains('dark-mode')).toBe(true);
    get('.dark').click();
    expect(get('.page').classList.contains('dark-mode')).toBe(false);
    expect(get('.dark').hasAttribute('aria-expanded')).toBe(false);
  });

  it('keeps the active class until the animation ends', () => {
    vi.useFakeTimers();
    const { get } = setup();
    get('.animated').click();
    expect(get('.info').classList.contains('fade-in')).toBe(true);
    get('.info').dispatchEvent(new Event('animationend'));
    expect(get('.info').classList.contains('fade-in')).toBe(false);
    get('.animated').click();
    expect(get('.info').classList.contains('fade-out')).toBe(true);
    expect(get('.info').classList.contains('hidden')).toBe(false);
    vi.runAllTimers();
    expect(get('.info').classList.contains('hidden')).toBe(true);
    vi.useRealTimers();
  });

  it('finds the previous sibling, the parent and the grandparent', () => {
    const fixture = TestBed.createComponent(TargetHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const get = (selector: string) => root.querySelector(selector) as HTMLElement;
    get('.prev').click();
    get('.to-parent').click();
    get('.to-grand').click();
    expect([get('.before'), get('.parent'), get('.grand')].map((element) => element.classList.contains('on'))).toEqual([true, true, true]);
  });

  it('does nothing when the target is missing', () => {
    const fixture = TestBed.createComponent(TargetHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const missing = root.querySelector('.missing') as HTMLElement;
    missing.click();
    (root.querySelector('.top') as HTMLElement).click();
    const directive = fixture.debugElement.query(By.css('.missing')).injector.get(TxStyleClass);
    directive.enter();
    directive.leave();
    expect(directive.target()).toBeNull();
    expect(directive.expanded()).toBe(false);
    expect(root.querySelector('.on')).toBeNull();
  });

  it('hides a pinned target on resize and Escape only while it shows', () => {
    const fixture = TestBed.createComponent(TargetHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector('.pinned') as HTMLElement;
    const panel = root.querySelector('.pinned-panel') as HTMLElement;
    const directive = fixture.debugElement.query(By.css('.pinned')).injector.get(TxStyleClass);

    directive.enter();
    expect(directive.expanded()).toBe(true);
    window.dispatchEvent(new Event('resize'));
    expect(directive.expanded()).toBe(false);
    expect(panel.classList.contains('leaving')).toBe(false);

    button.click();
    expect(directive.expanded()).toBe(false);

    directive.enter();
    panel.style.position = 'static';
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(directive.expanded()).toBe(true);
    panel.style.position = 'fixed';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(directive.expanded()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(directive.expanded()).toBe(false);
  });

  it('waits for the CSS duration and ignores clicks while animating', () => {
    vi.useFakeTimers();
    const { get } = setup();
    get('.info').style.transitionDuration = '0.1s, 300ms';
    get('.animated').click();
    get('.animated').click();
    vi.advanceTimersByTime(349);
    expect(get('.info').classList.contains('fade-in')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(get('.info').classList.contains('fade-in')).toBe(false);
    expect(get('.info').classList.contains('hidden')).toBe(false);
    vi.useRealTimers();
  });

  it('swaps classes at once when reduced motion is asked for', () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList);
    const { get } = setup();
    get('.animated').click();
    expect(get('.info').classList.contains('fade-in')).toBe(false);
    expect(get('.info').classList.contains('hidden')).toBe(false);
    window.matchMedia = matchMedia;
  });
});
