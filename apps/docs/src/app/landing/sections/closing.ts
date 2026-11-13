import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { LandingShapeKind, LandingTone } from '../landing.types';
import { LandingShape } from '../parts/shape';
import { DocsScrollProgress } from '../scroll-progress.directive';

interface ClosingShape {
  kind: LandingShapeKind;
  tone: LandingTone;
  x: number;
  y: number;
  size: number;
  spin: number;
}

@Component({
  selector: 'docs-landing-closing',
  imports: [RouterLink, TxButton, TxIcon, LandingShape, DocsScrollProgress],
  template: `
    <section class="closing" docsScrollProgress="view" aria-labelledby="closing-title">
      <div class="closing__shapes" aria-hidden="true">
        @for (shape of shapes; track $index) {
          <docs-landing-shape
            class="closing__shape"
            [kind]="shape.kind"
            [tone]="shape.tone"
            [style.left.%]="shape.x"
            [style.top.%]="shape.y"
            [style.--size]="shape.size"
            [style.--spin]="shape.spin"
          />
        }
      </div>
      <div class="closing__card">
        <h2 class="closing__title" id="closing-title">Start building.</h2>
        <p class="closing__lead">One install. Every component, block and token at one version.</p>
        <div class="closing__actions">
          <a txButton rounded size="large" routerLink="/getting-started">Get started</a>
          <a class="closing__more" routerLink="/components/button">See every component <tx-icon name="angle-right" /></a>
        </div>
      </div>
    </section>
  `,
  styleUrl: './closing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingClosing {
  readonly shapes: ClosingShape[] = [
    { kind: 'arch', tone: 'orange', x: 6, y: 18, size: 120, spin: 40 },
    { kind: 'circle', tone: 'green', x: 14, y: 62, size: 90, spin: -30 },
    { kind: 'square', tone: 'sky', x: 3, y: 78, size: 70, spin: 60 },
    { kind: 'diamond', tone: 'amber', x: 22, y: 34, size: 64, spin: -50 },
    { kind: 'quarter', tone: 'purple', x: 82, y: 14, size: 110, spin: -40 },
    { kind: 'leaf', tone: 'blue', x: 88, y: 56, size: 96, spin: 35 },
    { kind: 'triangle', tone: 'orange', x: 76, y: 74, size: 72, spin: -60 },
    { kind: 'ring', tone: 'green', x: 72, y: 36, size: 60, spin: 50 },
  ];
}
