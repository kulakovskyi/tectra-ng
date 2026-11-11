import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
});
