import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxConfetti } from './confetti.component';
import { TX_CONFETTI_PIECES } from './confetti.types';

@Component({
  imports: [TxConfetti],
  template: `
    <div class="scene">
      <tx-confetti [delay]="380" [dt]="{ piece: { size: '12px' } }" [pt]="{ piece: { class: 'own' } }" />
      <tx-confetti class="few" [pieces]="[{ x: 10, y: -20, rotate: 30, tone: 'success' }]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly confetti = viewChild.required(TxConfetti);
}

describe('TxConfetti', () => {
  it('draws the pieces with their targets, tones and delay', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-confetti') as HTMLElement;
    const pieces = Array.from(root.querySelectorAll<HTMLElement>('.tx-confetti__piece'));
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.style.getPropertyValue('--tx-confetti-delay')).toBe('380ms');
    expect(root.style.getPropertyValue('--tx-confetti-piece-size')).toBe('12px');
    expect(pieces).toHaveLength(TX_CONFETTI_PIECES.length);
    expect(pieces[0].style.getPropertyValue('--tx-confetti-x')).toBe('-150px');
    expect(pieces[0].style.getPropertyValue('--tx-confetti-y')).toBe('-90px');
    expect(pieces[0].style.getPropertyValue('--tx-confetti-r')).toBe('25deg');
    expect(pieces[1].getAttribute('data-tone')).toBe('neutral');
    expect(pieces[0].classList).toContain('own');
    const few = fixture.nativeElement.querySelector('.few') as HTMLElement;
    expect(few.querySelectorAll('.tx-confetti__piece')).toHaveLength(1);
  });

  it('plays the burst again with new pieces', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-confetti') as HTMLElement;
    const first = root.querySelector('.tx-confetti__piece');
    fixture.componentInstance.confetti().play();
    await fixture.whenStable();
    const second = root.querySelector('.tx-confetti__piece');
    expect(second).not.toBe(first);
    expect(root.querySelectorAll('.tx-confetti__piece')).toHaveLength(TX_CONFETTI_PIECES.length);
  });
});
