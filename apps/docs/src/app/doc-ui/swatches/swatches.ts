import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface DocsSwatch<T extends string = string> {
  value: T;
  label: string;
  color: string;
}

const STEPS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

@Component({
  selector: 'docs-swatches',
  template: `
    @for (item of options(); track item.value) {
      <button
        type="button"
        role="radio"
        class="swatch"
        [class.swatch--active]="value() === item.value"
        [style.--swatch]="item.color"
        [attr.aria-checked]="value() === item.value"
        [attr.aria-label]="item.label"
        [attr.tabindex]="value() === item.value ? 0 : -1"
        [title]="item.label"
        (keydown)="moveFocus($event)"
        (click)="value.set(item.value)"
      ></button>
    }
  `,
  styleUrl: './swatches.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'radiogroup',
    '[attr.aria-labelledby]': 'ariaLabelledBy()',
  },
})
export class DocsSwatches<T extends string = string> {
  readonly options = input.required<readonly DocsSwatch<T>[]>();
  readonly ariaLabelledBy = input<string>();
  readonly value = model<T>();

  moveFocus(event: KeyboardEvent): void {
    const radio = event.currentTarget as HTMLButtonElement;
    const radios = Array.from(radio.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []);
    const current = radios.indexOf(radio);
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? radios.length - 1 : event.key in STEPS ? (current + STEPS[event.key] + radios.length) % radios.length : -1;
    if (next < 0) {
      return;
    }
    event.preventDefault();
    radios[next].focus();
    radios[next].click();
  }
}
