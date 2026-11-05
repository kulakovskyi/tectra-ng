import {
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { TxStyleLoader } from '@tectra/core/styles';
import { TectraDeepPartial, TectraTextareaTokens, toStyleObject } from '@tectra/themes';
import { TxInput } from '@tectra/ui/input';
import { TxTextareaStyles } from './textarea.styles';
import { TxTextareaResize } from './textarea.types';

@Directive({
  selector: 'textarea[txTextarea]',
  exportAs: 'txTextarea',
  hostDirectives: [{ directive: TxInput, inputs: ['invalid', 'size', 'variant', 'fluid', 'dt: fieldDt', 'pt', 'ptOptions', 'unstyled'] }],
  host: {
    class: 'tx-textarea',
    '[attr.data-resize]': 'resize()',
    '[class.tx-textarea--auto-resize]': 'autoResize()',
    '[class.tx-textarea--borderless]': 'borderless()',
    '[style]': 'tokenStyle()',
    '(input)': 'onInput()',
  },
})
export class TxTextarea {
  private elementRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private document = inject(DOCUMENT);
  private ngControl = inject(NgControl, { self: true, optional: true });
  private lastHeight = 0;

  readonly autoResize = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly maxHeight = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  readonly maxRows = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  readonly resize = input<TxTextareaResize>('vertical');
  readonly borderless = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraTextareaTokens> | undefined>(undefined);

  readonly heightChange = output<number>();

  readonly length = signal(0);
  readonly maxLength = signal<number | null>(null);
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-textarea'));

  constructor() {
    inject(TxStyleLoader).load(TxTextareaStyles);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.sync();
      const subscription = this.ngControl?.valueChanges?.subscribe(() => queueMicrotask(() => this.sync()));
      const view = this.document.defaultView;
      const observer = view && 'ResizeObserver' in view ? new ResizeObserver(() => this.fit()) : null;
      observer?.observe(this.elementRef.nativeElement);
      destroyRef.onDestroy(() => {
        subscription?.unsubscribe();
        observer?.disconnect();
      });
    });
    effect(() => {
      this.autoResize();
      this.maxHeight();
      this.maxRows();
      queueMicrotask(() => this.fit());
    });
  }

  onInput(): void {
    this.sync();
  }

  private sync(): void {
    const element = this.elementRef.nativeElement;
    this.length.set(element.value.length);
    this.maxLength.set(element.maxLength > 0 ? element.maxLength : null);
    this.fit();
  }

  private fit(): void {
    const element = this.elementRef.nativeElement;
    if (!this.autoResize()) {
      if (element.style.height) {
        element.style.removeProperty('height');
        element.style.removeProperty('overflow-y');
      }
      return;
    }
    const style = this.document.defaultView?.getComputedStyle(element);
    const borders = style ? px(style.borderTopWidth) + px(style.borderBottomWidth) : 0;
    element.style.height = 'auto';
    const content = element.scrollHeight + borders;
    const limit = this.limit(style, borders);
    const height = limit ? Math.min(content, limit) : content;
    element.style.height = `${height}px`;
    element.style.overflowY = limit && content > limit ? 'auto' : 'hidden';
    if (height !== this.lastHeight) {
      this.lastHeight = height;
      this.heightChange.emit(height);
    }
  }

  private limit(style: CSSStyleDeclaration | undefined, borders: number): number | null {
    const maxHeight = this.maxHeight();
    if (maxHeight && maxHeight > 0) {
      return maxHeight;
    }
    const rows = this.maxRows();
    if (rows && style) {
      const lineHeight = px(style.lineHeight) || px(style.fontSize) * 1.5;
      return rows * lineHeight + px(style.paddingTop) + px(style.paddingBottom) + borders;
    }
    return null;
  }
}

function px(value: string): number {
  return parseFloat(value) || 0;
}
