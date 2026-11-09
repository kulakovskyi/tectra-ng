import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, ElementRef, booleanAttribute, computed, inject, input, numberAttribute, signal, viewChild } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraHoverEffectTokens, toStyleObject } from '@tectra-ng/themes';
import { TxHoverEffectPart } from './hover-effect.types';

@Component({
  selector: 'tx-hover-effect',
  template: `
    <div
      #layer
      class="tx-hover-effect__layer"
      [class.tx-hover-effect__layer--resting]="!active()"
      [style.--tx-hover-effect-x.deg]="tilt().x"
      [style.--tx-hover-effect-y.deg]="tilt().y"
      [class]="passThrough().layer?.class"
      [style]="passThrough().layer?.style"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './hover-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-hover-effect',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerleave)': 'reset()',
  },
})
export class TxHoverEffect {
  private readonly document = inject(DOCUMENT);
  private readonly layer = viewChild.required<ElementRef<HTMLElement>>('layer');
  private frame = 0;

  readonly constrain = input<number, unknown>(100, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraHoverEffectTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxHoverEffectPart, TxHoverEffect> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('hoverEffect', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-hover-effect'), ...this.passThrough().root?.style }));

  readonly tilt = signal({ x: 0, y: 0 });
  protected readonly active = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.document.defaultView?.cancelAnimationFrame?.(this.frame));
  }

  protected onPointerMove(event: PointerEvent): void {
    const view = this.document.defaultView;
    if (this.disabled() || event.pointerType !== 'mouse' || !view || view.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const { clientX, clientY } = event;
    view.cancelAnimationFrame(this.frame);
    this.frame = view.requestAnimationFrame(() => {
      const box = this.layer().nativeElement.getBoundingClientRect();
      const constrain = this.constrain() || 1;
      this.active.set(true);
      this.tilt.set({
        x: -(clientY - box.y - box.height / 2) / constrain,
        y: (clientX - box.x - box.width / 2) / constrain,
      });
    });
  }

  reset(): void {
    this.document.defaultView?.cancelAnimationFrame?.(this.frame);
    this.active.set(false);
    this.tilt.set({ x: 0, y: 0 });
  }
}
