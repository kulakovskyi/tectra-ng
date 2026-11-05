import { ChangeDetectionStrategy, Component, Type, effect, inject, input, signal } from '@angular/core';
import { ExampleFrame } from '../../../../doc-ui/example-frame/example-frame';
import { ExampleLoader } from '../../../../doc-ui/example-loader.service';
import { DocComponent } from '../../../../types/doc-component.interface';

@Component({
  selector: 'docs-features-tab',
  imports: [ExampleFrame],
  templateUrl: './features-tab.html',
  styleUrl: './features-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesTab {
  private exampleLoader = inject(ExampleLoader);

  doc = input.required<DocComponent>();
  components = signal<Map<string, Type<unknown>> | null>(null);

  constructor() {
    effect(() => {
      const { name, examples } = this.doc();
      const cached = this.exampleLoader.getCached(name, examples);
      this.components.set(cached);
      if (!cached) {
        this.exampleLoader.loadAll(name, examples).then((components) => this.components.set(components));
      }
    });
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }
}
