import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraToastTokens, toStyleObject } from '@tectra-ng/themes';
import { TxProgressSpinner } from '@tectra-ng/ui/progress-spinner';
import { TxToastTemplate } from './toast-template.directive';
import { TxToastService } from './toast.service';
import { TxToastAction, TxToastContext, TxToastMessage, TxToastPart, TxToastPosition, TxToastSeverity } from './toast.types';
import { TOAST_ICON_DEFAULTS } from './toast.icons';

const ICONS: Record<TxToastSeverity, string> = {
  success: 'check',
  info: 'info-circle',
  warn: 'exclamation-triangle',
  danger: 'times',
  secondary: 'info-circle',
  contrast: 'info-circle',
};

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 0.11;

interface TxToastSwipe {
  id: number;
  startX: number;
  startY: number;
  startedAt: number;
}

@Component({
  selector: 'tx-toast',
  imports: [NgTemplateOutlet, TxIcon, TxProgressSpinner],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-toast',
    role: 'region',
    '[attr.aria-label]': 'translations().notifications',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-position]': 'position()',
    '[attr.data-expanded]': 'expanded() ? "" : null',
    '[class.tx-toast--empty]': '!ordered().length',
    '(mouseenter)': 'setHovered(true)',
    '(mouseleave)': 'setHovered(false)',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
  },
  viewProviders: [provideTxIconDefaults(TOAST_ICON_DEFAULTS)],
})
export class TxToast {
  private service = inject(TxToastService);
  private iconRegistry = injectTxIcons();
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private document = inject(DOCUMENT);
  private swipe: TxToastSwipe | null = null;
  private pausedIds: number[] = [];

  readonly position = input<TxToastPosition>('bottom-center');
  readonly key = input<string | undefined>(undefined);
  readonly max = input<number, unknown>(3, { transform: numberAttribute });
  readonly inPlace = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraToastTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxToastPart, TxToast> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly customTemplate = contentChild(TxToastTemplate);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('toast', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-toast'), ...this.passThrough().root?.style }));

  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  private readonly heights = signal<Record<number, number>>({});
  private readonly mounted = signal<Record<number, true>>({});
  readonly swiping = signal<{ id: number; x: number; y: number } | null>(null);

  readonly expanded = computed(() => this.hovered() || this.focused());
  readonly ordered = computed(() => [...this.service.toasts().filter((toast) => toast.key === this.key())].reverse());
  readonly frontHeight = computed(() => this.heights()[this.ordered()[0]?.id] ?? 0);
  readonly offsets = computed(() => {
    const heights = this.heights();
    const gap = this.gap();
    let offset = 0;
    return this.ordered().map((toast) => {
      const current = offset;
      offset += (heights[toast.id] ?? 0) + gap;
      return current;
    });
  });

  constructor() {
    afterNextRender(() => {
      if (!this.inPlace()) {
        this.document.body.appendChild(this.host);
      }
    });
    afterRenderEffect(() => {
      const toasts = this.ordered();
      const items = [...this.host.querySelectorAll<HTMLElement>(':scope > .tx-toast__item:not(.tx-toast__item--leave)')];
      const heights: Record<number, number> = {};
      toasts.forEach((toast, index) => {
        heights[toast.id] = items[index]?.querySelector<HTMLElement>('.tx-toast__pill')?.offsetHeight ?? 0;
      });
      if (JSON.stringify(heights) !== JSON.stringify(this.heights())) {
        this.heights.set(heights);
      }
      const fresh = toasts.filter((toast) => !this.mounted()[toast.id]);
      if (fresh.length) {
        const mount = () =>
          this.mounted.update((mounted) => ({ ...mounted, ...Object.fromEntries(fresh.map((toast) => [toast.id, true as const])) }));
        const view = this.document.defaultView;
        if (view?.requestAnimationFrame) {
          view.requestAnimationFrame(() => view.requestAnimationFrame(mount));
        } else {
          setTimeout(mount);
        }
      }
      if (this.expanded()) {
        this.pauseNew(toasts);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.resumeAll();
      this.host.remove();
    });
  }

  isMounted(toast: TxToastMessage): boolean {
    return Boolean(this.mounted()[toast.id]);
  }

  heightOf(toast: TxToastMessage): number {
    return this.heights()[toast.id] ?? 0;
  }

  iconOf(toast: TxToastMessage): string | null {
    if (toast.icon === false) {
      return null;
    }
    const name = toast.icon ?? ICONS[toast.severity];
    return this.iconRegistry.has(name) ? name : null;
  }

  contextOf(toast: TxToastMessage): TxToastContext {
    return { $implicit: toast, close: () => this.service.close(toast.id, 'close') };
  }

  close(toast: TxToastMessage): void {
    this.service.close(toast.id, 'close');
  }

  run(toast: TxToastMessage, action: TxToastAction): void {
    this.service.run(toast.id, action);
  }

  setHovered(hovered: boolean): void {
    this.hovered.set(hovered);
    this.syncPause();
  }

  onFocusIn(): void {
    this.focused.set(true);
    this.syncPause();
  }

  onFocusOut(event: FocusEvent): void {
    if (!this.host.contains(event.relatedTarget as Node | null)) {
      this.focused.set(false);
      this.syncPause();
    }
  }

  onPointerDown(toast: TxToastMessage, event: PointerEvent): void {
    if (!toast.closable || event.button !== 0 || (event.target as Element).closest('button')) {
      return;
    }
    this.swipe = { id: toast.id, startX: event.clientX, startY: event.clientY, startedAt: Date.now() };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.swipe) {
      return;
    }
    const x = event.clientX - this.swipe.startX;
    const y = event.clientY - this.swipe.startY;
    if (Math.abs(x) > 2 || Math.abs(y) > 2) {
      this.swiping.set(Math.abs(x) >= Math.abs(y) ? { id: this.swipe.id, x, y: 0 } : { id: this.swipe.id, x: 0, y });
    }
  }

  onPointerUp(): void {
    const swipe = this.swipe;
    const moved = this.swiping();
    this.swipe = null;
    this.swiping.set(null);
    if (!swipe || !moved || moved.id !== swipe.id) {
      return;
    }
    const distance = Math.max(Math.abs(moved.x), Math.abs(moved.y));
    const velocity = distance / Math.max(Date.now() - swipe.startedAt, 1);
    if (distance >= SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
      this.service.close(swipe.id, 'close');
    }
  }

  private gap(): number {
    const value = this.document.defaultView?.getComputedStyle(this.host).getPropertyValue('--tx-toast-gap');
    return parseFloat(value ?? '') || 8;
  }

  private syncPause(): void {
    if (this.expanded()) {
      this.pauseNew(this.ordered());
    } else {
      this.resumeAll();
    }
  }

  private pauseNew(toasts: TxToastMessage[]): void {
    toasts
      .filter((toast) => !this.pausedIds.includes(toast.id))
      .forEach((toast) => {
        this.pausedIds.push(toast.id);
        this.service.pause(toast.id);
      });
  }

  private resumeAll(): void {
    const ids = this.pausedIds;
    this.pausedIds = [];
    ids.forEach((id) => this.service.resume(id));
  }
}
