import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocsLogoMark } from '../logo-mark/logo-mark';

@Component({
  selector: 'docs-logo',
  imports: [DocsLogoMark],
  template: `
    <docs-logo-mark class="logo__mark" />
    <span class="logo__text" aria-hidden="true">
      @for (letter of wordmark; track $index) {
        <span class="logo__letter" [style.--i]="$index">{{ letter }}</span>
      }
      <span class="logo__dot" [style.--i]="wordmark.length"></span>
    </span>
    @if (version(); as version) {
      <span class="logo__version" aria-hidden="true">v{{ version }}</span>
    }
  `,
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsLogo {
  readonly version = input<string | undefined>(undefined);
  readonly wordmark = ['t', 'e', 'c', 't', 'r', 'a'];
}
