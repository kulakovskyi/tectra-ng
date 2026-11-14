import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxAnimationReplay } from './animation-replay';

@Component({
  imports: [TxAnimationReplay],
  template: `<span class="target" [txAnimationReplay]="key()"></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly key = signal<unknown>(1);
}

describe('TxAnimationReplay', () => {
  it('restarts the CSS animation only when the key changes and keeps an own animation name', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const target = fixture.nativeElement.querySelector('.target') as HTMLElement;
    fixture.componentInstance.key.set(2);
    await fixture.whenStable();
    const names: string[] = [];
    Object.defineProperty(target, 'getAnimations', { configurable: true, value: () => [] });
    Object.defineProperty(target, 'offsetWidth', { configurable: true, get: () => (names.push(target.style.animationName), 0) });
    fixture.componentInstance.key.set(2);
    await fixture.whenStable();
    expect(names).toEqual([]);
    fixture.componentInstance.key.set(3);
    await fixture.whenStable();
    expect(names).toEqual(['none']);
    expect(target.style.animationName).toBe('');
    target.style.animationName = 'own';
    fixture.componentInstance.key.set(4);
    await fixture.whenStable();
    expect(names).toEqual(['none', 'none']);
    expect(target.style.animationName).toBe('own');
    Reflect.deleteProperty(target, 'getAnimations');
    Reflect.deleteProperty(target, 'offsetWidth');
  });
});
