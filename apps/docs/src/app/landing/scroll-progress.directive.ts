import { DOCUMENT, DestroyRef, Directive, ElementRef, afterNextRender, inject, input, numberAttribute, signal } from '@angular/core';

export type DocsScrollMode = 'sticky' | 'view' | 'leave';

@Directive({
  selector: '[docsScrollProgress]',
  exportAs: 'scrollProgress',
})
export class DocsScrollProgress {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly docsScrollProgress = input<DocsScrollMode>('view');
  readonly steps = input<number, unknown>(1, { transform: numberAttribute });

  readonly progress = signal(0);
  readonly step = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) {
        return;
      }
      let frame = 0;
      const schedule = () => {
        view.cancelAnimationFrame(frame);
        frame = view.requestAnimationFrame(() => this.measure());
      };
      view.addEventListener('scroll', schedule, { passive: true });
      view.addEventListener('resize', schedule);
      this.measure();
      destroyRef.onDestroy(() => {
        view.cancelAnimationFrame(frame);
        view.removeEventListener('scroll', schedule);
        view.removeEventListener('resize', schedule);
      });
    });
  }

  private measure(): void {
    const element = this.host.nativeElement;
    const rect = element.getBoundingClientRect();
    const height = this.document.documentElement.clientHeight;
    const mode = this.docsScrollProgress();
    const raw =
      mode === 'sticky' ? -rect.top / Math.max(rect.height - height, 1) : mode === 'leave' ? -rect.top / Math.max(rect.height, 1) : (height - rect.top) / (height * 0.75);
    const progress = Math.min(Math.max(raw, 0), 1);
    element.style.setProperty('--p', progress.toFixed(4));
    this.progress.set(progress);
    const steps = Math.max(this.steps(), 1);
    this.step.set(Math.min(steps - 1, Math.floor(progress * steps)));
  }
}
