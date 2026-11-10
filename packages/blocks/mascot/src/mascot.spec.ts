import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxMascot } from './mascot.component';
import { TX_MASCOT_TRICKS, txMascotLayers } from './mascot.data';
import { TxMascotState } from './mascot.types';

@Component({
  imports: [TxMascot],
  template: `
    <tx-mascot id="named" label="Assistant" [state]="state()" [size]="64" [dt]="{ root: { bodyColor: 'teal' } }" [pt]="{ svg: { class: 'own-svg' } }" />
    <tx-mascot id="plain" [playful]="false" size="3rem" unstyled />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly state = signal<TxMascotState>('idle');
}

describe('TxMascot', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('draws the sprite as pixels grouped by part', () => {
    expect(el('#named svg').getAttribute('viewBox')).toBe('0 0 15 12');
    expect(el('#named .tx-mascot__part--eye').querySelectorAll('rect')).toHaveLength(8);
    expect(el('#named .tx-mascot__part--leg-left').querySelectorAll('rect')).toHaveLength(4);
    expect(el('#named .tx-mascot__upper .tx-mascot__part--antenna rect').getAttribute('x')).toBe('7');
    expect(txMascotLayers(['mouth'], ['.MM', 'M..'])[0].pixels).toEqual([{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }]);
  });

  it('is a named image with a label and decorative without one', () => {
    expect(el('#named').getAttribute('role')).toBe('img');
    expect(el('#named').getAttribute('aria-label')).toBe('Assistant');
    expect(el('#named').hasAttribute('aria-hidden')).toBe(false);
    expect(el('#plain').getAttribute('aria-hidden')).toBe('true');
    expect(el('#plain').hasAttribute('aria-label')).toBe(false);
  });

  it('shows the state and plays a trick from time to time while idle', () => {
    expect(el('#named').getAttribute('data-state')).toBe('idle');
    fixture.componentInstance.state.set('thinking');
    fixture.detectChanges();
    expect(el('#named').getAttribute('data-state')).toBe('thinking');
    fixture.componentInstance.state.set('idle');
    vi.advanceTimersByTime(6000);
    fixture.detectChanges();
    expect(TX_MASCOT_TRICKS).toContain(el('#named').getAttribute('data-state'));
    expect(el('#plain').getAttribute('data-state')).toBe('idle');
    vi.advanceTimersByTime(3000);
    fixture.detectChanges();
    expect(el('#named').getAttribute('data-state')).toBe('idle');
  });

  it('takes a size, design tokens and pass-through, and drops its styles when unstyled', () => {
    expect(el('#named').style.getPropertyValue('--tx-mascot-size')).toBe('64px');
    expect(el('#named').style.getPropertyValue('--tx-mascot-body-color')).toBe('teal');
    expect(el('#named svg').classList).toContain('own-svg');
    expect(el('#plain').style.getPropertyValue('--tx-mascot-size')).toBe('3rem');
    expect(el('#named').hasAttribute('data-styled')).toBe(true);
    expect(el('#plain').hasAttribute('data-styled')).toBe(false);
  });
});
