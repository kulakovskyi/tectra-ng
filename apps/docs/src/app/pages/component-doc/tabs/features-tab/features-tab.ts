import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Type, effect, inject, input, signal } from '@angular/core';
import { ExampleFrame } from '../../../../doc-ui/example-frame/example-frame';
import { ExampleLoader } from '../../../../doc-ui/example-loader.service';
import { DocComponent } from '../../../../types/doc-component.interface';

const ACTIVE_OFFSET = 160;

@Component({
  selector: 'docs-features-tab',
  imports: [ExampleFrame],
  templateUrl: './features-tab.html',
  styleUrl: './features-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:scroll)': 'scheduleActiveUpdate()' },
})
export class FeaturesTab {
  private exampleLoader = inject(ExampleLoader);
  private document = inject(DOCUMENT);
  private frame = 0;

  doc = input.required<DocComponent>();
  components = signal<Map<string, Type<unknown>> | null>(null);
  activeId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const { name, examples } = this.doc();
      const cached = this.exampleLoader.getCached(name, examples);
      this.components.set(cached);
      if (!cached) {
        this.exampleLoader.loadAll(name, examples).then((components) => this.components.set(components));
      }
    });
    effect(() => {
      this.components();
      this.activeId.set(this.doc().examples[0]?.id ?? null);
    });
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));
  }

  scheduleActiveUpdate(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.updateActive());
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }

  private updateActive(): void {
    const examples = this.doc().examples;
    const view = this.document.defaultView;
    const isAtBottom = !!view && view.innerHeight + view.scrollY >= this.document.documentElement.scrollHeight - 2;
    if (isAtBottom) {
      this.activeId.set(examples.at(-1)?.id ?? null);
      return;
    }
    let active = examples[0]?.id ?? null;
    for (const { id } of examples) {
      const top = this.document.getElementById(id)?.getBoundingClientRect().top;
      if (top === undefined || top > ACTIVE_OFFSET) {
        break;
      }
      active = id;
    }
    this.activeId.set(active);
  }
}
