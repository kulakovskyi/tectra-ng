import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTooltip } from './tooltip.directive';
import { provideTxTooltip } from './tooltip.options';
import { TxTooltipEvent } from './tooltip.types';

@Component({
  imports: [TxTooltip],
  template: `
    <button
      id="save"
      txTooltip="Save changes"
      tooltipPlacement="bottom-start"
      tooltipClass="own-class"
      [tooltipEvent]="event()"
      [tooltipDisabled]="disabled()"
      [tooltipDt]="{ root: { maxWidth: '200px' } }"
      [tooltipPt]="{ content: { class: 'own-content' } }"
      (tooltipShown)="shown = shown + 1"
      (tooltipHidden)="hidden = hidden + 1"
    >
      Save
    </button>
    <button id="icon" [txTooltip]="'Delete'"><svg aria-hidden="true"></svg></button>
    <button id="labelled" aria-label="Archive" txTooltip="Moves to the archive"></button>
    <button id="rich" [txTooltip]="roles" [tooltipContext]="['Owner', 'Editor']" tooltipUnstyled>Roles</button>
    <ng-template #roles let-list let-close="close">
      <ul>
        @for (role of list; track role) {
          <li>{{ role }}</li>
        }
      </ul>
      <button class="close" (click)="close()">Close</button>
    </ng-template>
    <span id="manual" txTooltip="Copied" tooltipEvent="manual" [tooltipLife]="1000" #copied="txTooltip">Link</span>
    <span id="overflow" txTooltip="Full text" tooltipOverflowOnly>Short</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly event = signal<TxTooltipEvent>('both');
  readonly disabled = signal(false);
  readonly copied = viewChild.required<TxTooltip>('copied');
  shown = 0;
  hidden = 0;
}

describe('TxTooltip', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const panel = () => document.querySelector('tx-tooltip') as HTMLElement | null;
  const settle = async () => {
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
  };
  const flush = async () => {
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
  };
  const fire = (target: Element, type: string) => target.dispatchEvent(new Event(type, { bubbles: true }));

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTxTooltip({ showDelay: 0, hideDelay: 0, interactive: false })] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await settle();
  });

  afterEach(() => {
    vi.useRealTimers();
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('describes its element with the text before it is shown', () => {
    const save = el('#save');
    const description = document.getElementById(save.getAttribute('aria-describedby') ?? '');
    expect(description?.textContent).toBe('Save changes');
    expect(description?.closest('[hidden]')).not.toBeNull();
  });

  it('names an element that has no name of its own and only describes a named one', () => {
    const icon = el('#icon');
    expect(document.getElementById(icon.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Delete');
    expect(icon.hasAttribute('aria-describedby')).toBe(false);
    const labelled = el('#labelled');
    expect(labelled.hasAttribute('aria-labelledby')).toBe(false);
    expect(document.getElementById(labelled.getAttribute('aria-describedby') ?? '')?.textContent).toBe('Moves to the archive');
  });

  it('shows on hover and hides on leave', async () => {
    fire(el('#save'), 'mouseenter');
    await settle();
    const tooltip = panel();
    expect(tooltip?.textContent?.trim()).toBe('Save changes');
    expect(tooltip?.getAttribute('role')).toBe('tooltip');
    expect(tooltip?.getAttribute('aria-hidden')).toBe('true');
    expect(tooltip?.getAttribute('data-placement')).toBe('bottom-start');
    expect(tooltip?.getAttribute('data-side')).toBe('bottom');
    expect(tooltip?.hasAttribute('data-styled')).toBe(true);
    expect(tooltip?.classList).toContain('own-class');
    expect(tooltip?.querySelector('.tx-tooltip__content')?.classList).toContain('own-content');
    expect(tooltip?.querySelector('.tx-tooltip__arrow')).not.toBeNull();
    expect(tooltip?.style.getPropertyValue('--tx-tooltip-max-width')).toBe('200px');
    expect(tooltip?.closest('.cdk-overlay-container')).not.toBeNull();
    expect(fixture.componentInstance.shown).toBe(1);

    fire(el('#save'), 'mouseleave');
    await settle();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.hidden).toBe(1);
  });

  it('hides on press and stays hidden until the pointer leaves', async () => {
    const save = el('#save');
    fire(save, 'mouseenter');
    await settle();
    fire(save, 'pointerdown');
    fire(save, 'focusin');
    await settle();
    expect(panel()).toBeNull();
    fire(save, 'mouseleave');
    fire(save, 'mouseenter');
    await settle();
    expect(panel()).not.toBeNull();
  });

  it('closes with Escape and stays closed until hovered again', async () => {
    const save = el('#save');
    fire(save, 'mouseenter');
    await settle();
    save.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(panel()).toBeNull();
    fire(save, 'focusin');
    await settle();
    expect(panel()).toBeNull();
  });

  it('shows on focus in focus mode and hides on blur', async () => {
    fixture.componentInstance.event.set('focus');
    await settle();
    const save = el('#save');
    fire(save, 'mouseenter');
    await settle();
    expect(panel()).toBeNull();
    fire(save, 'focusin');
    await settle();
    expect(panel()).not.toBeNull();
    fire(save, 'focusout');
    await settle();
    expect(panel()).toBeNull();
  });

  it('hides and stops describing when disabled', async () => {
    fire(el('#save'), 'mouseenter');
    await settle();
    fixture.componentInstance.disabled.set(true);
    await settle();
    expect(panel()).toBeNull();
    expect(el('#save').hasAttribute('aria-describedby')).toBe(false);
    fire(el('#save'), 'mouseleave');
    fire(el('#save'), 'mouseenter');
    await settle();
    expect(panel()).toBeNull();
  });

  it('renders a template with its context, describes the element with the panel and can close itself', async () => {
    const rich = el('#rich');
    fire(rich, 'mouseenter');
    await settle();
    const tooltip = panel();
    expect([...(tooltip?.querySelectorAll('li') ?? [])].map((item) => item.textContent)).toEqual(['Owner', 'Editor']);
    expect(tooltip?.hasAttribute('aria-hidden')).toBe(false);
    expect(tooltip?.hasAttribute('data-styled')).toBe(false);
    expect(rich.getAttribute('aria-describedby')).toBe(tooltip?.id);
    (tooltip?.querySelector('.close') as HTMLButtonElement).click();
    await settle();
    expect(panel()).toBeNull();
    expect(rich.hasAttribute('aria-describedby')).toBe(false);
  });

  it('opens from code in manual mode and hides after its life', async () => {
    vi.useFakeTimers();
    fire(el('#manual'), 'mouseenter');
    await flush();
    expect(panel()).toBeNull();
    fixture.componentInstance.copied().show();
    await flush();
    expect(panel()?.textContent?.trim()).toBe('Copied');
    expect(panel()?.hasAttribute('aria-hidden')).toBe(false);
    expect(el('#manual').getAttribute('aria-describedby')).toBe(panel()?.id);
    expect(fixture.componentInstance.copied().isOpen()).toBe(true);
    vi.advanceTimersByTime(1000);
    await flush();
    expect(panel()).toBeNull();
  });

  it('shows only when the text overflows in overflow mode', async () => {
    const overflow = el('#overflow');
    expect(overflow.hasAttribute('aria-describedby')).toBe(false);
    fire(overflow, 'mouseenter');
    await settle();
    expect(panel()).toBeNull();
    Object.defineProperty(overflow, 'scrollWidth', { configurable: true, value: 300 });
    Object.defineProperty(overflow, 'clientWidth', { configurable: true, value: 100 });
    fire(overflow, 'mouseleave');
    fire(overflow, 'mouseenter');
    await settle();
    expect(panel()?.textContent?.trim()).toBe('Full text');
  });
});

describe('TxTooltip delays', () => {
  @Component({
    imports: [TxTooltip],
    template: `<button id="one" txTooltip="One">One</button><button id="two" txTooltip="Two">Two</button>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class DelayHost {}

  it('waits for the show delay and skips it while another tooltip is open', async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideTxTooltip({ showDelay: 300, interactive: false })] });
    const fixture = TestBed.createComponent(DelayHost);
    fixture.autoDetectChanges();
    fixture.detectChanges();
    const one = fixture.nativeElement.querySelector('#one') as HTMLElement;
    const two = fixture.nativeElement.querySelector('#two') as HTMLElement;
    one.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(299);
    fixture.detectChanges();
    expect(document.querySelector('tx-tooltip')).toBeNull();
    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(document.querySelector('tx-tooltip')?.textContent?.trim()).toBe('One');
    one.dispatchEvent(new Event('mouseleave'));
    two.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();
    const texts = [...document.querySelectorAll('tx-tooltip')].map((tooltip) => tooltip.textContent?.trim());
    expect(texts).toEqual(['Two']);
    vi.useRealTimers();
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });
});
