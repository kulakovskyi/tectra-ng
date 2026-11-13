import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocsClipboard } from '../../doc-ui/copy/clipboard.service';
import { DocsCopyIcon } from '../../doc-ui/copy/copy-icon';
import { INSTALL_COMMAND } from '../../data/home.data';
import { INSTALL_SNIPPET } from '../landing.data';
import { LandingShape } from '../parts/shape';
import { DocsScrollProgress } from '../scroll-progress.directive';

@Component({
  selector: 'docs-landing-start',
  imports: [DocsCopyIcon, LandingShape, DocsScrollProgress],
  template: `
    <section class="start" aria-labelledby="start-title" docsScrollProgress="view">
      <div class="start__panel">
        <div class="start__copy">
          <span class="start__label">Start</span>
          <h2 class="start__title" id="start-title">Five lines to a themed app.</h2>
          <button type="button" class="start__install" (click)="copy()">
            <code>{{ command }}</code>
            <docs-copy-icon [copied]="copied()" />
            <span class="sr-only">Copy the install command</span>
          </button>
        </div>
        <pre class="code"><code>@for (part of snippet; track $index) {<span [class]="'code__' + part.kind">{{ part.text }}</span>}</code></pre>
        <docs-landing-shape class="start__shape start__shape--one" kind="circle" tone="green" />
        <docs-landing-shape class="start__shape start__shape--two" kind="arch" tone="orange" />
      </div>
    </section>
  `,
  styleUrl: './start.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingStart {
  private readonly clipboard = inject(DocsClipboard);

  readonly snippet = INSTALL_SNIPPET;
  readonly command = INSTALL_COMMAND;
  readonly copied = signal(false);

  copy(): void {
    this.clipboard.copy(this.command);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1600);
  }
}
