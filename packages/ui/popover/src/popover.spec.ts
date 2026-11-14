import { InteractivityChecker } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxPopover } from './popover.component';
import { TxPopoverContent, TxPopoverFooter, TxPopoverHeader } from './popover-slots.directive';
import { TxPopoverTrigger } from './popover-trigger.directive';
import { TxPopoverAutoFocus, TxPopoverCloseReason } from './popover.types';

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

@Component({
  imports: [TxPopover, TxPopoverTrigger, TxPopoverHeader, TxPopoverFooter, TxPopoverContent],
  template: `
    <button id="before">Before</button>
    <button id="anchor" [txPopoverTrigger]="pop">Open</button>
    <button id="after">After</button>
    <tx-popover #pop panelClass="own-pane" header="Custom title" closeButton [autoFocus]="autoFocus()" (closed)="reasons.push($event)">
      <span txPopoverHeader class="header-extra">Beta</span>
      <button id="one">One</button>
      <button id="two">Two</button>
      <div txPopoverFooter><button id="three">Three</button></div>
    </tx-popover>
    <span id="spot-a">A</span>
    <span id="spot-b">B</span>
    <tx-popover #solo closeButton ariaLabel="Solo" [arrow]="false" (closed)="soloReasons.push($event)">
      <ng-template txPopoverContent let-done="close">
        <button class="solo-done" (click)="done()">Done</button>
      </ng-template>
    </tx-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FocusHost {
  readonly autoFocus = signal<TxPopoverAutoFocus>('first');
  readonly pop = viewChild.required<TxPopover>('pop');
  readonly solo = viewChild.required<TxPopover>('solo');
  readonly reasons: TxPopoverCloseReason[] = [];
  readonly soloReasons: TxPopoverCloseReason[] = [];
}

const checker: Pick<InteractivityChecker, 'isTabbable' | 'isVisible' | 'isFocusable'> = {
  isTabbable: (element: HTMLElement) => element.tabIndex >= 0,
  isVisible: () => true,
  isFocusable: () => true,
};

describe('TxPopover focus and API', () => {
  let fixture: ComponentFixture<FocusHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const panel = (selector = '.tx-popover') => document.querySelector(selector) as HTMLElement | null;
  const settle = async () => {
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
  };
  const tab = (target: HTMLElement, shiftKey = false) => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [{ provide: InteractivityChecker, useValue: checker }] });
    fixture = TestBed.createComponent(FocusHost);
    fixture.autoDetectChanges();
    await settle();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('focuses the first content control, names itself by the title only and adds the pane class', async () => {
    el('#anchor').click();
    await settle();
    const dialog = panel() as HTMLElement;
    expect(document.activeElement?.id).toBe('one');
    expect(dialog.closest('.tx-popover-pane')?.classList).toContain('own-pane');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent?.trim()).toBe('Custom title');
    const extra = dialog.querySelector('.header-extra') as HTMLElement;
    expect(extra.closest('.tx-popover__title')).toBeNull();
    expect(extra.parentElement?.classList).toContain('tx-popover__header');
    expect(extra.previousElementSibling?.classList).toContain('tx-popover__title');
    expect(extra.nextElementSibling?.classList).toContain('tx-popover__close');
    expect(dialog.querySelector('.tx-popover__close')?.classList).not.toContain('tx-popover__close--floating');
    expect(fixture.componentInstance.pop().isOpen()).toBe(true);
    fixture.componentInstance.pop().updatePosition();
    expect(panel()).not.toBeNull();
  });

  it('keeps Tab inside, and leaves with Tab at the edges', async () => {
    el('#anchor').click();
    await settle();
    const dialog = panel() as HTMLElement;
    const other = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    dialog.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
    expect(tab(dialog).defaultPrevented).toBe(false);
    expect(tab(dialog, true).defaultPrevented).toBe(false);
    (dialog.querySelector('.tx-popover__close') as HTMLElement).focus();
    expect(tab(dialog, true).defaultPrevented).toBe(true);
    await settle();
    expect(panel()).toBeNull();

    el('#anchor').click();
    await settle();
    (panel()?.querySelector('#three') as HTMLElement).focus();
    expect(tab(panel() as HTMLElement).defaultPrevented).toBe(true);
    await settle();
    expect(panel()).toBeNull();
    expect(document.activeElement?.id).toBe('after');
    expect(fixture.componentInstance.reasons).toEqual(['tab', 'tab']);
  });

  it('focuses the panel itself, or nothing', async () => {
    fixture.componentInstance.autoFocus.set('panel');
    await settle();
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, buttons: 1, detail: 1 }));
    el('#anchor').click();
    await settle();
    expect(document.activeElement).toBe(panel());
    expect(panel()?.hasAttribute('data-keyboard')).toBe(false);
    el('#anchor').click();
    await settle();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    el('#anchor').click();
    await settle();
    expect(document.activeElement).toBe(panel());
    expect(panel()?.hasAttribute('data-keyboard')).toBe(true);
    el('#anchor').click();
    await settle();
    fixture.componentInstance.autoFocus.set('none');
    await settle();
    el('#anchor').focus();
    el('#anchor').click();
    await settle();
    expect(panel()).not.toBeNull();
    expect(document.activeElement?.id).toBe('anchor');
  });

  it('opens only at a target without triggers, and moves between targets', async () => {
    const solo = fixture.componentInstance.solo();
    solo.show();
    solo.toggle();
    await settle();
    expect(panel()).toBeNull();
    solo.show(el('#spot-a'));
    await settle();
    const dialog = panel() as HTMLElement;
    expect(dialog.getAttribute('aria-label')).toBe('Solo');
    expect(dialog.querySelector('.tx-popover__arrow')).toBeNull();
    expect(dialog.querySelector('.tx-popover__close')?.classList).toContain('tx-popover__close--floating');
    solo.show(el('#spot-a'));
    await settle();
    expect(fixture.componentInstance.soloReasons).toEqual([]);
    solo.show(el('#spot-b'));
    await settle();
    expect(solo.isOpenFor(el('#spot-b'))).toBe(true);
    expect(solo.isOpen()).toBe(true);
    expect(fixture.componentInstance.soloReasons).toEqual(['api']);
    (panel()?.querySelector('.solo-done') as HTMLButtonElement).click();
    await settle();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.soloReasons).toEqual(['api', 'api']);
  });

  it('takes the anchor from a dispatched event and closes silently on destroy', async () => {
    const solo = fixture.componentInstance.solo();
    const event = new Event('custom');
    el('#spot-a').dispatchEvent(event);
    solo.toggle(event);
    await settle();
    expect(solo.isOpenFor(el('#spot-a'))).toBe(true);
    fixture.destroy();
    expect(fixture.componentInstance.soloReasons).toEqual([]);
  });
});

describe('popover content directive', () => {
  it('narrows its template context', () => {
    const close = () => undefined;
    expect(TxPopoverContent.ngTemplateContextGuard({} as TxPopoverContent, { $implicit: close, close })).toBe(true);
    expect(TxPopoverContent.ngTemplateContextGuard({} as TxPopoverContent, undefined)).toBe(false);
  });
});
