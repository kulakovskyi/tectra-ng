import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxScrollEnd } from './scroll-end.directive';

@Component({
  imports: [TxScrollEnd],
  template: `<div class="box" txScrollEnd [offset]="20" [maxLimit]="30" [currentCount]="count()" (scrolledToBottom)="loads = loads + 1"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EndHost {
  readonly count = signal(10);
  loads = 0;
}

describe('txScrollEnd', () => {
  function setup() {
    const fixture = TestBed.createComponent(EndHost);
    fixture.detectChanges();
    const box = fixture.nativeElement.querySelector('.box') as HTMLElement;
    let height = 1000;
    Object.defineProperty(box, 'scrollHeight', { get: () => height, configurable: true });
    Object.defineProperty(box, 'clientHeight', { value: 200, configurable: true });
    const scrollTo = (top: number) => {
      box.scrollTop = top;
      Object.defineProperty(box, 'scrollTop', { value: top, configurable: true, writable: true });
      box.dispatchEvent(new Event('scroll'));
    };
    return { fixture, scrollTo, grow: () => (height += 1000) };
  }

  it('asks for more near the end, once per content height', () => {
    const { fixture, scrollTo, grow } = setup();
    scrollTo(500);
    expect(fixture.componentInstance.loads).toBe(0);
    scrollTo(785);
    scrollTo(800);
    expect(fixture.componentInstance.loads).toBe(1);
    grow();
    scrollTo(1790);
    expect(fixture.componentInstance.loads).toBe(2);
  });

  it('stops at the limit', () => {
    const { fixture, scrollTo } = setup();
    fixture.componentInstance.count.set(30);
    fixture.detectChanges();
    scrollTo(800);
    expect(fixture.componentInstance.loads).toBe(0);
  });
  it('asks again for the same height after a reset', () => {
    const { fixture, scrollTo } = setup();
    scrollTo(800);
    scrollTo(800);
    expect(fixture.componentInstance.loads).toBe(1);
    fixture.debugElement.query(By.directive(TxScrollEnd)).injector.get(TxScrollEnd).reset();
    scrollTo(800);
    expect(fixture.componentInstance.loads).toBe(2);
  });
});
