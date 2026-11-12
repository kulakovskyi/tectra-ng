import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraImageTokens, toStyleObject } from '@tectra-ng/themes';
import { TxImageLayer, openImageLayer } from './image-layer';
import { TxImageIndicatorTemplate, TxImagePreviewTemplate } from './image.templates';
import { TxImageLoading, TxImagePart, TxImagePreviewContext } from './image.types';
import { IMAGE_ICON_DEFAULTS } from './image.icons';

const PAN_THRESHOLD = 3;

@Component({
  selector: 'tx-image',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-image',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-image--preview]': 'preview()',
    '[class.tx-image--open]': 'visible()',
  },
  viewProviders: [provideTxIconDefaults(IMAGE_ICON_DEFAULTS)],
})
export class TxImage {
  private injector = inject(Injector);
  private viewContainerRef = inject(ViewContainerRef);
  private document = inject(DOCUMENT);
  private layer: TxImageLayer | null = null;
  private pan: { pointerId: number; x: number; y: number; originX: number; originY: number; moved: boolean } | null = null;

  readonly src = input<string | undefined>(undefined);
  readonly srcSet = input<string | undefined>(undefined);
  readonly sizes = input<string | undefined>(undefined);
  readonly previewSrc = input<string | undefined>(undefined);
  readonly previewSrcSet = input<string | undefined>(undefined);
  readonly previewSizes = input<string | undefined>(undefined);
  readonly alt = input<string | undefined>(undefined);
  readonly width = input<string | number | undefined>(undefined);
  readonly height = input<string | number | undefined>(undefined);
  readonly loading = input<TxImageLoading | undefined>(undefined);
  readonly preview = input(false, { transform: booleanAttribute });
  readonly previewIcon = input<TxIconName | (string & {})>('eye');
  readonly zoomStep = input(0.1, { transform: numberAttribute });
  readonly minZoom = input(0.5, { transform: numberAttribute });
  readonly maxZoom = input(1.5, { transform: numberAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraImageTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxImagePart, TxImage> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly imageError = output<Event>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('image', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-image'), ...this.passThrough().root?.style }));
  readonly layerStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-image'), ...this.passThrough().mask?.style }));

  protected readonly indicatorTemplate = contentChild(TxImageIndicatorTemplate);
  protected readonly previewTemplate = contentChild(TxImagePreviewTemplate);
  private readonly layerTemplate = viewChild.required<TemplateRef<unknown>>('layer');

  readonly visible = signal(false);
  readonly rotation = signal(0);
  readonly scale = signal(1);
  readonly offset = signal({ x: 0, y: 0 });
  readonly panning = signal(false);

  readonly fullSrc = computed(() => this.previewSrc() ?? this.src() ?? '');
  readonly fullSrcSet = computed(() => (this.previewSrc() ? this.previewSrcSet() : (this.previewSrcSet() ?? this.srcSet())));
  readonly fullSizes = computed(() => (this.previewSrc() ? this.previewSizes() : (this.previewSizes() ?? this.sizes())));
  readonly previewLabel = computed(() => this.ariaLabel() ?? this.alt() ?? this.translations().imagePreview);
  readonly canZoomIn = computed(() => this.scale() < this.maxZoom() - 1e-6);
  readonly canZoomOut = computed(() => this.scale() > this.minZoom() + 1e-6);
  readonly transform = computed(() => {
    const { x, y } = this.offset();
    return `translate(${x}px, ${y}px) rotate(${this.rotation()}deg) scale(${this.scale()})`;
  });
  readonly previewContext = computed<TxImagePreviewContext>(() => ({
    $implicit: this.fullSrc(),
    src: this.fullSrc(),
    alt: this.alt() ?? '',
    style: { transform: this.transform() },
    close: () => this.close(),
  }));

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      const layer = this.layer;
      this.layer = null;
      void layer?.close();
      this.stopPan();
    });
  }

  open(): void {
    if (this.layer) {
      return;
    }
    this.rotation.set(0);
    this.scale.set(1);
    this.offset.set({ x: 0, y: 0 });
    this.visible.set(true);
    this.layer = openImageLayer(this.layerTemplate(), {
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
      focus: '.tx-image-preview__close',
      onEscape: () => this.close(),
      onDetach: () => this.close(),
    });
    this.opened.emit();
  }

  close(): void {
    const layer = this.layer;
    if (!layer) {
      return;
    }
    this.layer = null;
    this.stopPan();
    void layer.close().then(() => {
      this.visible.set(false);
      this.closed.emit();
    });
  }

  rotateRight(): void {
    this.rotation.update((value) => value + 90);
  }

  rotateLeft(): void {
    this.rotation.update((value) => value - 90);
  }

  zoomIn(): void {
    this.zoomTo(this.scale() + this.zoomStep());
  }

  zoomOut(): void {
    this.zoomTo(this.scale() - this.zoomStep());
  }

  resetZoom(): void {
    this.zoomTo(1);
  }

  protected onMaskClick(event: MouseEvent): void {
    const target = event.target as Element;
    if (!target.closest('.tx-image-preview__toolbar, .tx-image-preview__original, .tx-image-preview__custom')) {
      this.close();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.target as Element).closest('input, textarea, [contenteditable]')) {
      return;
    }
    const actions: Record<string, () => void> = {
      '+': () => this.zoomIn(),
      '=': () => this.zoomIn(),
      '-': () => this.zoomOut(),
      '0': () => this.resetZoom(),
    };
    const action = event.ctrlKey || event.metaKey || event.altKey ? undefined : actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  protected onWheel(event: WheelEvent): void {
    if (!event.deltaY) {
      return;
    }
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  protected onDoubleClick(): void {
    this.zoomTo(this.scale() > 1 ? 1 : this.maxZoom());
  }

  protected startPan(event: PointerEvent): void {
    if (event.button !== 0 || this.scale() <= 1) {
      return;
    }
    event.preventDefault();
    const { x, y } = this.offset();
    this.pan = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: x, originY: y, moved: false };
    this.document.addEventListener('pointermove', this.movePan);
    this.document.addEventListener('pointerup', this.endPan);
    this.document.addEventListener('pointercancel', this.endPan);
  }

  protected imageFailed(event: Event): void {
    this.imageError.emit(event);
  }

  private readonly movePan = (event: PointerEvent): void => {
    const pan = this.pan;
    if (!pan || event.pointerId !== pan.pointerId) {
      return;
    }
    const dx = event.clientX - pan.x;
    const dy = event.clientY - pan.y;
    if (!pan.moved && Math.hypot(dx, dy) < PAN_THRESHOLD) {
      return;
    }
    pan.moved = true;
    this.panning.set(true);
    this.offset.set({ x: pan.originX + dx, y: pan.originY + dy });
  };

  private readonly endPan = (): void => {
    this.stopPan();
  };

  private stopPan(): void {
    this.pan = null;
    this.panning.set(false);
    this.document.removeEventListener('pointermove', this.movePan);
    this.document.removeEventListener('pointerup', this.endPan);
    this.document.removeEventListener('pointercancel', this.endPan);
  }

  private zoomTo(value: number): void {
    const next = Math.round(Math.min(Math.max(value, this.minZoom()), this.maxZoom()) * 1000) / 1000;
    this.scale.set(next);
    if (next <= 1) {
      this.offset.set({ x: 0, y: 0 });
    }
  }
}
