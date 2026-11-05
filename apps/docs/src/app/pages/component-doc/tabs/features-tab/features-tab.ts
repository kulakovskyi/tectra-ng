import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ExampleFrame } from '../../../../doc-ui/example-frame/example-frame';
import { DocComponent } from '../../../../types/doc-component.interface';

@Component({
  selector: 'docs-features-tab',
  imports: [ExampleFrame],
  template: `
    @for (example of doc().examples; track example.id) {
      <docs-example-frame [example]="example" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesTab {
  doc = input.required<DocComponent>();
}
