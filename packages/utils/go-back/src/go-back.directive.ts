import { Location } from '@angular/common';
import { Directive, ElementRef, HostAttributeToken, inject, input, output } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

const NATIVE_CONTROLS = ['BUTTON', 'A', 'INPUT', 'SUMMARY'];

@Directive({
  selector: '[txGoBack]',
  exportAs: 'txGoBack',
  host: {
    '[attr.role]': 'needsRole ? "button" : null',
    '[attr.tabindex]': 'needsRole ? 0 : null',
    '(click)': 'onClick($event)',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
})
export class TxGoBack {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly fallback = input<string | readonly unknown[] | UrlTree>('/', { alias: 'txGoBack' });

  readonly navigated = output<'back' | 'fallback'>();

  protected readonly needsRole = !NATIVE_CONTROLS.includes(this.element.tagName.toUpperCase()) && inject(new HostAttributeToken('role'), { optional: true }) === null;

  canGoBack(): boolean {
    const state = this.location.getState() as { navigationId?: number } | null;
    return (state?.navigationId ?? 1) > 1;
  }

  back(): void {
    if (this.canGoBack()) {
      this.location.back();
      this.navigated.emit('back');
      return;
    }
    const target = this.fallback() || '/';
    void (target instanceof UrlTree ? this.router.navigateByUrl(target) : typeof target === 'string' ? this.router.navigateByUrl(target) : this.router.navigate([...target]));
    this.navigated.emit('fallback');
  }

  protected onClick(event: Event): void {
    event.preventDefault();
    this.back();
  }

  protected onKey(event: Event): void {
    if (this.needsRole) {
      event.preventDefault();
      this.back();
    }
  }
}
