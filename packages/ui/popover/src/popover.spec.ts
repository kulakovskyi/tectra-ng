import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxPopover } from './popover.component';
import { TxPopoverContent, TxPopoverFooter } from './popover-slots.directive';
import { TxPopoverTrigger } from './popover-trigger.directive';
import { TxPopoverCloseReason } from './popover.types';

@Component({
  imports: [TxPopover, TxPopoverTrigger, TxPopoverFooter, TxPopoverContent],
  template: `
    <button id="share" [txPopoverTrigger]="share">Share</button>
    <button id="other" (click)="share.toggle($event)">Other</button>
    <tx-popover
      #share
      header="Share link"
      closeButton
      arrow
      [(open)]="open"
      [dt]="{ root: { minWidth: '260px' } }"
      [pt]="{ content: { class: 'own-content' } }"
      (opened)="events.push('opened')"
      (closed)="reasons.push($event)"
    >
      <input id="link" aria-label="Link" value="https://example.com" />
      <div txPopoverFooter><button id="copy">Copy</button></div>
    </tx-popover>

    <button id="lazy-trigger" [txPopoverTrigger]="lazy">Lazy</button>
    <tx-popover #lazy ariaLabel="Lazy panel" [dismissable]="false" unstyled>
      <ng-template txPopoverContent let-close>
        <p class="lazy-text">Made on open</p>
        <button class="lazy-close" (click)="close()">Done</button>
      </ng-template>
    </tx-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly open = signal(false);
  readonly share = viewChild.required<TxPopover>('share');
  readonly events: string[] = [];
  readonly reasons: TxPopoverCloseReason[] = [];
}

describe('TxPopover', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const panel = (selector = '.tx-popover') => document.querySelector(selector) as HTMLElement | null;
  const settle = async () => {
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await settle();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens from its trigger as a named dialog and closes from it again', async () => {
    const trigger = el('#share');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.focus();
    trigger.click();
    await settle();
    const dialog = panel();
    expect(dialog?.getAttribute('role')).toBe('dialog');
    expect(document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')?.textContent?.trim()).toBe('Share link');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(dialog?.id);
    expect(dialog?.contains(document.activeElement)).toBe(true);
    expect(dialog?.querySelector('#link')).not.toBeNull();
    expect(dialog?.querySelector('.tx-popover__footer #copy')).not.toBeNull();
    expect(dialog?.querySelector('.tx-popover__content')?.classList).toContain('own-content');
    expect(dialog?.querySelector('.tx-popover__arrow')).not.toBeNull();
    expect(dialog?.style.getPropertyValue('--tx-popover-min-width')).toBe('260px');
    expect(dialog?.getAttribute('data-placement')).toBe('bottom-start');
    expect(fixture.componentInstance.open()).toBe(true);
    expect(fixture.componentInstance.events).toEqual(['opened']);

    trigger.click();
    await settle();
    expect(panel()).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.reasons).toEqual(['api']);
  });

  it('closes with Escape, the close button and an outside click', async () => {
    el('#share').click();
    await settle();
    panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(panel()).toBeNull();

    el('#share').click();
    await settle();
    const close = panel()?.querySelector('.tx-popover__close') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Close');
    close.click();
    await settle();
    expect(panel()).toBeNull();

    el('#share').click();
    await settle();
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.reasons).toEqual(['escape', 'api', 'outside']);
  });

  it('opens from the model at its trigger and moves to another target', async () => {
    fixture.componentInstance.open.set(true);
    await settle();
    expect(el('#share').getAttribute('aria-expanded')).toBe('true');
    el('#other').click();
    await settle();
    expect(panel()).not.toBeNull();
    expect(el('#share').getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.share().isOpenFor(el('#other'))).toBe(true);
    fixture.componentInstance.open.set(false);
    await settle();
    expect(panel()).toBeNull();
  });

  it('makes lazy content on open, lets it close and can ignore outside clicks', async () => {
    expect(document.querySelector('.lazy-text')).toBeNull();
    el('#lazy-trigger').click();
    await settle();
    const lazy = panel();
    expect(lazy?.getAttribute('aria-label')).toBe('Lazy panel');
    expect(lazy?.hasAttribute('aria-labelledby')).toBe(false);
    expect(lazy?.hasAttribute('data-styled')).toBe(false);
    expect(lazy?.querySelector('.lazy-text')?.textContent).toBe('Made on open');
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(panel()).not.toBeNull();
    (lazy?.querySelector('.lazy-close') as HTMLButtonElement).click();
    await settle();
    expect(panel()).toBeNull();
  });
});
