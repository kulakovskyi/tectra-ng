import { InteractivityChecker } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxFocusTrap } from './focus-trap.directive';

@Component({
  imports: [TxFocusTrap],
  template: `
    <button id="outside">Outside</button>
    @if (open()) {
      <div txFocusTrap><button id="first">First</button><button id="last">Last</button></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  open = signal(false);
}

describe('TxFocusTrap', () => {
  it('focuses inside on open and gives focus back on close', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: InteractivityChecker,
          useValue: {
            isFocusable: (element: HTMLElement) => element.tagName === 'BUTTON',
            isTabbable: (element: HTMLElement) => element.tagName === 'BUTTON',
            isVisible: () => true,
            isDisabled: () => false,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const outside = fixture.nativeElement.querySelector('#outside') as HTMLButtonElement;
    outside.focus();
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('first');
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
    fixture.nativeElement.remove();
  });
});
