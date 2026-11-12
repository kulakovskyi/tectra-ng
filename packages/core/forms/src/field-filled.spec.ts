import { ChangeDetectionStrategy, Component, Directive, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { injectFieldFilled } from './field-filled';

@Directive({ selector: '[testFilled]', host: { '[attr.data-filled]': 'isFilled()' } })
class TestFilled {
  readonly isFilled = injectFieldFilled();
}

@Component({
  imports: [TestFilled, ReactiveFormsModule],
  template: `
    <input testFilled id="bound" [formControl]="control" />
    @if (plain()) {
      <input testFilled id="plain" value="Kyiv" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly control = new FormControl('');
  readonly plain = signal(true);
}

describe('injectFieldFilled', () => {
  it('follows typing and the bound form control', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('#bound') as HTMLInputElement;
    expect(field.getAttribute('data-filled')).toBe('false');

    field.value = 'a';
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(field.getAttribute('data-filled')).toBe('true');

    fixture.componentInstance.control.setValue('');
    await Promise.resolve();
    await fixture.whenStable();
    expect(field.getAttribute('data-filled')).toBe('false');
  });

  it('reads the initial value of a field without a form control and stops listening when destroyed', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('#plain') as HTMLInputElement;
    expect(field.getAttribute('data-filled')).toBe('true');

    const removeListener = vi.spyOn(field, 'removeEventListener');
    fixture.componentInstance.plain.set(false);
    await fixture.whenStable();
    expect(removeListener).toHaveBeenCalledWith('input', expect.any(Function));
  });
});
