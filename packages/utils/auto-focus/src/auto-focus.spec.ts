import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxAutoFocus } from './auto-focus.directive';

@Component({
  imports: [TxAutoFocus],
  template: `
    @if (variant() === 'input') {
      <input aria-label="Name" value="Ann" txAutoFocus select />
    } @else if (variant() === 'wrapper') {
      <div txAutoFocus><span>Label</span><input aria-label="Inner" /></div>
    } @else {
      <input aria-label="Off" [txAutoFocus]="false" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FocusHost {
  readonly variant = signal<'input' | 'wrapper' | 'off'>('input');
}

describe('txAutoFocus', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(variant: 'input' | 'wrapper' | 'off') {
    const fixture = TestBed.createComponent(FocusHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentInstance.variant.set(variant);
    fixture.detectChanges();
    TestBed.tick();
    vi.runAllTimers();
    return fixture;
  }

  it('focuses and selects an input after render', async () => {
    const fixture = await render('input');
    const input = document.activeElement as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Name');
    expect((input.selectionEnd ?? 0) - (input.selectionStart ?? 0)).toBe(3);
    fixture.nativeElement.remove();
  });

  it('focuses the first field inside a wrapper', async () => {
    const fixture = await render('wrapper');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Inner');
    fixture.nativeElement.remove();
  });

  it('stays off when turned off', async () => {
    (document.activeElement as HTMLElement | null)?.blur();
    const fixture = await render('off');
    expect(document.activeElement?.getAttribute('aria-label')).not.toBe('Off');
    fixture.nativeElement.remove();
  });
});
