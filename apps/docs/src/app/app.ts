import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsLayout } from './layout/docs-layout';

@Component({
  selector: 'docs-root',
  imports: [DocsLayout],
  template: '<docs-layout />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
