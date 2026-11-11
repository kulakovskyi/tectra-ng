import { Directive, ElementRef, Renderer2, booleanAttribute, effect, inject, input } from '@angular/core';

function toEventList(value: unknown): readonly string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return typeof value === 'string' && value.trim() ? value.trim().split(/[\s,]+/) : ['click'];
}

@Directive({ selector: '[txStopPropagation]' })
export class TxStopPropagation {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  readonly events = input<readonly string[], unknown>(['click'], { alias: 'txStopPropagation', transform: toEventList });
  readonly preventDefault = input<boolean, unknown>(false, { transform: booleanAttribute });

  constructor() {
    effect((onCleanup) => {
      const stops = [...this.events()].map((name) =>
        this.renderer.listen(this.element, name, (event: Event) => {
          event.stopPropagation();
          if (this.preventDefault()) {
            event.preventDefault();
          }
        }),
      );
      onCleanup(() => stops.forEach((stop) => stop()));
    });
  }
}
