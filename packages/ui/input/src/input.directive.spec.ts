import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxInput } from './input.directive';

@Component({
  imports: [TxInput],
  template: `<input txInput [invalid]="invalid()" [size]="'small'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  invalid = signal(false);
}

describe('TxInput', () => {
  it('styles the native input and marks it invalid', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.classList).toContain('tx-input');
    expect(input.getAttribute('data-size')).toBe('small');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    fixture.componentInstance.invalid.set(true);
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.classList).toContain('tx-input--invalid');
  });
});
