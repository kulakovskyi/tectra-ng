import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsLogoMark } from '../../layout/logo-mark/logo-mark';
import { INTRO_ORBIT, INTRO_STATEMENT } from '../landing.data';
import { LandingShape } from '../parts/shape';
import { DocsScrollProgress } from '../scroll-progress.directive';

@Component({
  selector: 'docs-landing-intro',
  imports: [DocsLogoMark, LandingShape, DocsScrollProgress],
  template: `
    <section class="intro" aria-labelledby="intro-label">
      <div class="intro__frame">
        <h2 class="intro__label" id="intro-label">What is tectra</h2>
        <p class="intro__statement" docsScrollProgress="view">
          @for (word of words; track $index; let index = $index) {
            <span class="intro__word" [style.--w]="index / words.length">{{ word }}</span>
            {{ ' ' }}
          }
        </p>
        <div class="intro__loop" docsScrollProgress="view">
          <div class="orbit" aria-hidden="true">
            <div class="orbit__ring">
              @for (item of orbit; track $index; let index = $index) {
                <span class="orbit__item" [style.--a]="(index * 360) / orbit.length + 'deg'">
                  <docs-landing-shape [kind]="item.kind" [tone]="item.tone" [icon]="item.icon" />
                </span>
              }
            </div>
            <span class="orbit__core"><docs-logo-mark /></span>
          </div>
          <p class="intro__aside">
            Every admin app needs the same parts. tectra ships them as one kit, at one version and in one look, so you can start with the part that is yours.
          </p>
        </div>
      </div>
    </section>
  `,
  styleUrl: './intro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingIntro {
  readonly words = INTRO_STATEMENT.split(' ');
  readonly orbit = INTRO_ORBIT;
}
