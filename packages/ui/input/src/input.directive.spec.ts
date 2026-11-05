import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxInput } from './input.directive';

@Component({
  imports: [TxInput, ReactiveFormsModule],
  template: `
    <input txInput id="plain" [invalid]="invalid()" [size]="'small'" [variant]="'filled'" />
    <input txInput id="bound" [formControl]="control" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly invalid = signal<boolean | undefined>(false);
  readonly control = new FormControl('', Validators.required);
}

describe('TxInput', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    return { fixture, plain: fixture.nativeElement.querySelector('#plain') as HTMLInputElement, bound: fixture.nativeElement.querySelector('#bound') as HTMLInputElement };
  }

  it('styles the native input with size and variant', async () => {
    const { plain } = await render();
    expect(plain.classList).toContain('tx-input');
    expect(plain.getAttribute('data-size')).toBe('small');
    expect(plain.getAttribute('data-variant')).toBe('filled');
  });

  it('marks invalid from the input', async () => {
    const { fixture, plain } = await render();
    expect(plain.hasAttribute('aria-invalid')).toBe(false);
    fixture.componentInstance.invalid.set(true);
    await fixture.whenStable();
    expect(plain.getAttribute('aria-invalid')).toBe('true');
    expect(plain.classList).toContain('tx-input--invalid');
  });

  it('follows the form control once it is touched', async () => {
    const { fixture, bound } = await render();
    expect(bound.hasAttribute('aria-invalid')).toBe(false);
    bound.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(bound.getAttribute('aria-invalid')).toBe('true');
  });
});
