import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, Renderer2, booleanAttribute, inject, input, signal } from '@angular/core';

function toSelector(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : '@next';
}

const split = (classes: string | undefined): string[] => (classes ?? '').split(/\s+/).filter(Boolean);

@Directive({
  selector: '[txStyleClass]',
  exportAs: 'txStyleClass',
  host: {
    '(click)': 'toggle()',
    '[attr.aria-expanded]': 'toggleClass() ? null : expanded()',
  },
})
export class TxStyleClass {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly listeners: (() => void)[] = [];
  private animating = false;
  private endTimer: ReturnType<typeof setTimeout> | undefined;

  readonly selector = input<string, unknown>('@next', { alias: 'txStyleClass', transform: toSelector });
  readonly enterFromClass = input<string | undefined>(undefined);
  readonly enterActiveClass = input<string | undefined>(undefined);
  readonly enterToClass = input<string | undefined>(undefined);
  readonly leaveFromClass = input<string | undefined>(undefined);
  readonly leaveActiveClass = input<string | undefined>(undefined);
  readonly leaveToClass = input<string | undefined>(undefined);
  readonly toggleClass = input<string | undefined>(undefined);
  readonly hideOnOutsideClick = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly hideOnEscape = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly hideOnResize = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly expanded = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.unbind();
      clearTimeout(this.endTimer);
    });
  }

  target(): HTMLElement | null {
    const selector = this.selector();
    switch (selector) {
      case '@next':
        return this.host.nextElementSibling as HTMLElement | null;
      case '@prev':
        return this.host.previousElementSibling as HTMLElement | null;
      case '@parent':
        return this.host.parentElement;
      case '@grandparent':
        return this.host.parentElement?.parentElement ?? null;
      default:
        return this.document.querySelector<HTMLElement>(selector);
    }
  }

  toggle(): void {
    const target = this.target();
    if (!target || this.animating) {
      return;
    }
    const toggleClass = this.toggleClass();
    if (toggleClass) {
      split(toggleClass).forEach((name) => (target.classList.contains(name) ? this.renderer.removeClass(target, name) : this.renderer.addClass(target, name)));
      return;
    }
    if (this.isHidden(target)) {
      this.enter(target);
    } else {
      this.leave(target);
    }
  }

  enter(target = this.target()): void {
    if (!target) {
      return;
    }
    this.swap(target, [...split(this.leaveToClass()), ...split(this.enterFromClass())], split(this.enterToClass()));
    this.expanded.set(true);
    this.bind(target);
    this.animate(target, split(this.enterActiveClass()));
  }

  leave(target = this.target()): void {
    if (!target) {
      return;
    }
    const active = split(this.leaveActiveClass());
    this.unbind();
    this.expanded.set(false);
    this.renderer.addClass(target, '__tx-leaving');
    split(this.leaveFromClass()).forEach((name) => this.renderer.addClass(target, name));
    this.animate(target, active, () => {
      this.renderer.removeClass(target, '__tx-leaving');
      this.swap(target, [...split(this.enterToClass()), ...split(this.leaveFromClass())], split(this.leaveToClass()));
    });
  }

  private animate(target: HTMLElement, active: string[], done?: () => void): void {
    const reduced = this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (!active.length || reduced) {
      done?.();
      return;
    }
    this.animating = true;
    active.forEach((name) => this.renderer.addClass(target, name));
    const finish = () => {
      if (!this.animating) {
        return;
      }
      this.animating = false;
      clearTimeout(this.endTimer);
      stopAnimation();
      stopTransition();
      active.forEach((name) => this.renderer.removeClass(target, name));
      done?.();
    };
    const stopAnimation = this.renderer.listen(target, 'animationend', finish);
    const stopTransition = this.renderer.listen(target, 'transitionend', finish);
    this.endTimer = setTimeout(finish, this.duration(target) + 50);
  }

  private duration(target: HTMLElement): number {
    const style = this.document.defaultView?.getComputedStyle(target);
    const toMs = (value: string | undefined) => Math.max(0, ...(value ?? '0s').split(',').map((part) => parseFloat(part) * (part.trim().endsWith('ms') ? 1 : 1000) || 0));
    return Math.max(toMs(style?.animationDuration), toMs(style?.transitionDuration));
  }

  private swap(target: HTMLElement, remove: string[], add: string[]): void {
    remove.forEach((name) => this.renderer.removeClass(target, name));
    add.forEach((name) => this.renderer.addClass(target, name));
  }

  private isHidden(target: HTMLElement): boolean {
    if (target.classList.contains('__tx-leaving')) {
      return true;
    }
    const hiddenBy = split(this.leaveToClass());
    if (hiddenBy.length) {
      return hiddenBy.every((name) => target.classList.contains(name));
    }
    return target.offsetParent === null && this.document.defaultView?.getComputedStyle(target).position !== 'fixed';
  }

  private bind(target: HTMLElement): void {
    this.unbind();
    if (this.hideOnOutsideClick()) {
      this.listeners.push(
        this.renderer.listen(this.document, 'click', (event: Event) => {
          const node = event.target as Node | null;
          if (node && !target.contains(node) && !this.host.contains(node) && !this.isHidden(target)) {
            this.leave(target);
          }
        }),
      );
    }
    if (this.hideOnEscape()) {
      this.listeners.push(
        this.renderer.listen(this.document, 'keydown', (event: KeyboardEvent) => {
          if (event.key === 'Escape' && !this.isHidden(target)) {
            this.leave(target);
            this.host.focus?.();
          }
        }),
      );
    }
    if (this.hideOnResize()) {
      this.listeners.push(this.renderer.listen('window', 'resize', () => !this.isHidden(target) && this.leave(target)));
    }
  }

  private unbind(): void {
    this.listeners.splice(0).forEach((stop) => stop());
  }
}
