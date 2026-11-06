import { FocusTrap, FocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import { CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  Type,
  ViewContainerRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { tabbableElements } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { toStyleObject } from '@tectra-ng/themes';
import { TxDialogRef } from './dialog-ref';
import { TxDialogPart, TxDialogTemplateContext } from './dialog.types';

const FIELDS = ['.tx-dialog-content', '.tx-dialog-footer', '.tx-dialog-header'];
const LEAVE_LIMIT = 400;
const DEFAULT_BREAKPOINTS: Record<string, string> = { '960px': '500px', '640px': '90vw' };

@Component({
  selector: 'tx-dialog-container',
  imports: [CdkPortalOutlet],
  templateUrl: './dialog-container.component.html',
  styleUrl: './dialog-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-dialog-container',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-position]': 'drawer ? null : position',
    '[attr.data-drawer]': 'drawer',
    '[class.tx-dialog-container--modal]': 'modal',
    '[class.tx-dialog-container--leaving]': 'leaving()',
    '[class.tx-dialog-container--maximized]': 'ref.maximized()',
  },
})
export class TxDialogContainer {
  readonly ref = inject(TxDialogRef);
  private document = inject(DOCUMENT);
  private checker = inject(InteractivityChecker);
  private focusTrapFactory = inject(FocusTrapFactory);
  private viewContainerRef = inject(ViewContainerRef);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private focusTrap: FocusTrap | null = null;

  readonly config = this.ref.config;
  readonly outlet = viewChild.required(CdkPortalOutlet);
  readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  readonly modal = this.config.modal !== false;
  readonly role = this.config.role ?? 'dialog';
  readonly size = this.config.size ?? 'medium';
  readonly position = this.config.position ?? 'center';
  readonly drawer = this.config.drawer ?? null;
  readonly isUnstyled = injectUnstyled(signal(this.config.unstyled));
  readonly passThrough = injectPassThrough<TxDialogPart, TxDialogContainer>('dialog', this, signal(undefined), signal(undefined));
  readonly leaving = signal(false);
  readonly dragging = signal(false);
  readonly offset = signal({ x: 0, y: 0 });
  private readonly sizeOverride = signal<{ width?: string; height?: string }>({});
  private readonly breakpointWidth = signal<string | null>(null);

  readonly labelledBy = computed(() => this.config.ariaLabelledBy ?? (this.config.ariaLabel ? null : this.ref.titleId()));
  readonly rootClass = computed(() => [this.passThrough().root?.class, ...[this.config.panelClass ?? []].flat()].filter(Boolean).join(' '));
  readonly panelStyle = computed(() => {
    const maximized = this.ref.maximized();
    const override = this.sizeOverride();
    const { x, y } = this.offset();
    const style: Record<string, string> = {};
    const width = maximized ? '100%' : (override.width ?? this.breakpointWidth() ?? this.config.width);
    const height = maximized ? '100%' : (override.height ?? this.config.height);
    if (width) {
      style['width'] = width;
    }
    if (height) {
      style['height'] = height;
    }
    if (!maximized) {
      Object.assign(
        style,
        Object.fromEntries(
          [
            ['min-width', this.config.minWidth],
            ['max-width', this.config.maxWidth],
            ['max-height', this.config.maxHeight],
          ].filter(([, value]) => value),
        ),
      );
      if (x || y) {
        style['translate'] = `${x}px ${y}px`;
      }
    }
    return { ...style, ...this.passThrough().root?.style };
  });
  readonly hostStyle = computed(() => {
    const drawerSize = this.config.drawerSize ?? 'medium';
    const presets: Record<string, string> = { small: 'var(--tx-dialog-drawer-sm)', medium: 'var(--tx-dialog-drawer-md)', large: 'var(--tx-dialog-drawer-lg)', full: '100%' };
    return { ...toStyleObject(this.config.dt, '--tx-dialog'), ...(this.drawer ? { '--_drawer-size': presets[drawerSize] ?? drawerSize } : {}) };
  });

  constructor() {
    this.watchBreakpoints();
    inject(DestroyRef).onDestroy(() => this.focusTrap?.destroy());
  }

  attach<C, D, R>(content: Type<C> | TemplateRef<TxDialogTemplateContext<D, R>>, injector: Injector, data: D | undefined): ComponentRef<C> | null {
    if (content instanceof TemplateRef) {
      const context: TxDialogTemplateContext<D, R> = { $implicit: data, close: (result) => void this.ref.close(result) };
      this.outlet().attachTemplatePortal(new TemplatePortal(content, this.viewContainerRef, context, injector));
      return null;
    }
    const componentRef = this.outlet().attachComponentPortal(new ComponentPortal(content, this.config.viewContainerRef ?? null, injector));
    const body = componentRef.location.nativeElement as HTMLElement;
    body.classList.add('tx-dialog__body');
    body.style.display = 'contents';
    for (const [name, value] of Object.entries(this.config.inputs ?? {})) {
      componentRef.setInput(name, value);
    }
    return componentRef;
  }

  enter(): void {
    const panel = this.panel().nativeElement;
    this.focusTrap = this.focusTrapFactory.create(panel);
    const autoFocus = this.config.autoFocus ?? 'first';
    if (autoFocus === 'none') {
      return;
    }
    const target =
      autoFocus === 'first'
        ? FIELDS.map((selector) => panel.querySelector(selector))
            .map((part) => (part ? tabbableElements(part, this.checker)[0] : undefined))
            .find(Boolean)
        : autoFocus === 'dialog'
          ? undefined
          : panel.querySelector<HTMLElement>(autoFocus);
    (target ?? panel).focus({ preventScroll: true });
  }

  leave(): Promise<void> {
    this.leaving.set(true);
    this.host.nativeElement.classList.add('tx-dialog-container--leaving');
    const panel = this.panel().nativeElement;
    const mask = panel.parentElement?.querySelector(':scope > .tx-dialog-mask');
    const animations = [panel, mask].flatMap((element) => (element && typeof element.getAnimations === 'function' ? element.getAnimations() : []));
    const finished = Promise.all(animations.map((animation) => animation.finished.catch(() => undefined))).then(() => undefined);
    return animations.length ? Promise.race([finished, new Promise<void>((resolve) => setTimeout(resolve, LEAVE_LIMIT))]) : finished;
  }

  updateSize(width?: string, height?: string): void {
    this.sizeOverride.set({ width, height });
  }

  onMaskClick(): void {
    if (this.config.dismissableMask ?? this.config.closable ?? true) {
      void this.ref.close();
    }
  }

  dragFrom(event: PointerEvent): void {
    if (!this.config.draggable || this.ref.maximized() || event.button !== 0) {
      return;
    }
    if ((event.target as Element).closest('button, a, input, select, textarea, [contenteditable]')) {
      return;
    }
    event.preventDefault();
    const panel = this.panel().nativeElement.getBoundingClientRect();
    const view = this.document.documentElement;
    const origin = { pointerX: event.clientX, pointerY: event.clientY, ...this.offset() };
    const move = (moveEvent: PointerEvent) => {
      const dx = Math.min(Math.max(moveEvent.clientX - origin.pointerX, -panel.left), view.clientWidth - panel.right);
      const dy = Math.min(Math.max(moveEvent.clientY - origin.pointerY, -panel.top), view.clientHeight - panel.bottom);
      this.offset.set({ x: origin.x + dx, y: origin.y + dy });
    };
    const stop = () => {
      this.dragging.set(false);
      this.document.removeEventListener('pointermove', move);
      this.document.removeEventListener('pointerup', stop);
    };
    this.dragging.set(true);
    this.document.addEventListener('pointermove', move);
    this.document.addEventListener('pointerup', stop);
  }

  private watchBreakpoints(): void {
    const view = this.document.defaultView;
    const fitsDefaults = !this.drawer && this.size !== 'fullscreen';
    const entries = Object.entries(this.config.breakpoints ?? (fitsDefaults ? DEFAULT_BREAKPOINTS : {}))
      .map(([max, width]) => ({ query: view?.matchMedia?.(`(max-width: ${max})`), max: parseFloat(max), width }))
      .sort((a, b) => a.max - b.max);
    if (!entries.length || !entries[0].query) {
      return;
    }
    const pick = () => this.breakpointWidth.set(entries.find((entry) => entry.query?.matches)?.width ?? null);
    pick();
    entries.forEach((entry) => entry.query?.addEventListener('change', pick));
    inject(DestroyRef).onDestroy(() => entries.forEach((entry) => entry.query?.removeEventListener('change', pick)));
  }
}
