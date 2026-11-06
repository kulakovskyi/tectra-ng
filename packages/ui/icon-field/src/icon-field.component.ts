import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  contentChild,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { injectFluid } from '@tectra-ng/core/fluid';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'tx-icon-field',
  templateUrl: './icon-field.component.html',
  styleUrl: './icon-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-icon-field',
    '[class.tx-icon-field--fluid]': 'isFluid()',
    '[style.--tx-field-inset-start]': 'startInset() + "px"',
    '[style.--tx-field-inset-end]': 'endInset() + "px"',
  },
})
export class TxIconField {
  private destroyRef = inject(DestroyRef);

  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly input = contentChild(TxInput, { read: ElementRef });
  readonly inputDirective = contentChild(TxInput);
  readonly control = contentChild(NgControl);
  readonly start = viewChild.required<ElementRef<HTMLElement>>('start');
  readonly end = viewChild.required<ElementRef<HTMLElement>>('end');

  readonly isFluid = injectFluid(this.fluid);
  readonly startInset = signal(0);
  readonly endInset = signal(0);
  readonly hasValue = signal(false);
  readonly isEditable = signal(true);

  constructor() {
    afterNextRender(() => {
      this.watchInsets();
      this.watchValue();
    });
  }

  value(): string {
    return (this.input()?.nativeElement as HTMLInputElement | undefined)?.value ?? '';
  }

  clear(): void {
    const element = this.input()?.nativeElement as HTMLInputElement | undefined;
    if (!element) {
      return;
    }
    const control = this.control()?.control;
    if (control) {
      control.setValue('');
      control.markAsDirty();
    } else {
      element.value = '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    this.hasValue.set(false);
    element.focus();
  }

  private watchInsets(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const measure = () => {
      this.startInset.set(this.inset(this.start().nativeElement));
      this.endInset.set(this.inset(this.end().nativeElement));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(this.start().nativeElement);
    observer.observe(this.end().nativeElement);
    measure();
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private watchValue(): void {
    const element = this.input()?.nativeElement as HTMLInputElement | undefined;
    if (!element) {
      return;
    }
    const update = () => {
      this.hasValue.set(!!element.value);
      this.isEditable.set(!element.disabled && !element.readOnly);
    };
    element.addEventListener('input', update);
    const subscription = this.control()?.control?.events.subscribe(() => queueMicrotask(update));
    this.destroyRef.onDestroy(() => {
      element.removeEventListener('input', update);
      subscription?.unsubscribe();
    });
    update();
  }

  private inset(container: HTMLElement): number {
    const width = container.getBoundingClientRect().width;
    return width ? Math.round(width + 6) : 0;
  }
}
