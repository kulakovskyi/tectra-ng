import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSparkline, sparklinePoints } from './sparkline.component';
import { TxSparklineTone } from './sparkline.types';

@Component({
  imports: [TxSparkline],
  template: `
    <tx-sparkline
      id="trend"
      [values]="values()"
      [tone]="tone()"
      [ariaLabel]="label()"
      [dt]="{ root: { height: '48px' } }"
      [pt]="{ line: { class: 'own-line' } }"
    />
    <tx-sparkline id="plain" [values]="[1, 2]" unstyled />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly values = signal<number[] | null>([2, 4, 3, 8]);
  readonly tone = signal<TxSparklineTone>('primary');
  readonly label = signal<string | undefined>(undefined);
}

describe('TxSparkline', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('scales the points between the min and the max', () => {
    expect(sparklinePoints([2, 4, 3, 8])).toEqual([
      { x: 0, y: 33 },
      { x: 40, y: 23 },
      { x: 80, y: 28 },
      { x: 120, y: 3 },
    ]);
    expect(sparklinePoints([5, 5]).map((point) => point.y)).toEqual([33, 33]);
    expect(sparklinePoints([1, Number.NaN, 3])).toHaveLength(2);
    expect(sparklinePoints([1])).toEqual([]);
  });

  it('draws a line and a closed area', () => {
    expect(el('#trend .tx-sparkline__line').getAttribute('d')).toBe('M0,33 L40,23 L80,28 L120,3');
    expect(el('#trend .tx-sparkline__area').getAttribute('d')).toBe('M0,33 L40,23 L80,28 L120,3 L120,36 L0,36 Z');
    expect(el('#trend svg').getAttribute('viewBox')).toBe('0 0 120 36');
    expect(el('#trend .own-line')).not.toBeNull();
  });

  it('draws nothing for fewer than two values', async () => {
    fixture.componentInstance.values.set([4]);
    await fixture.whenStable();
    expect(el('#trend svg')).toBeNull();
    fixture.componentInstance.values.set(null);
    await fixture.whenStable();
    expect(el('#trend svg')).toBeNull();
  });

  it('is hidden from screen readers unless it has a label', async () => {
    expect(el('#trend').getAttribute('aria-hidden')).toBe('true');
    expect(el('#trend').hasAttribute('role')).toBe(false);
    fixture.componentInstance.label.set('Visits went up');
    await fixture.whenStable();
    expect(el('#trend').getAttribute('role')).toBe('img');
    expect(el('#trend').getAttribute('aria-label')).toBe('Visits went up');
    expect(el('#trend').hasAttribute('aria-hidden')).toBe(false);
  });

  it('reflects the tone, tokens and unstyled', async () => {
    expect(el('#trend').getAttribute('data-tone')).toBe('primary');
    fixture.componentInstance.tone.set('danger');
    await fixture.whenStable();
    expect(el('#trend').getAttribute('data-tone')).toBe('danger');
    expect(el('#trend').style.getPropertyValue('--tx-sparkline-height')).toBe('48px');
    expect(el('#trend').hasAttribute('data-styled')).toBe(true);
    expect(el('#plain').hasAttribute('data-styled')).toBe(false);
  });
});
