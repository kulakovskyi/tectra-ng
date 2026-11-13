import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxButton } from '@tectra-ng/ui/button';
import { QUESTIONS } from '../landing.data';
import { DocsScrollProgress } from '../scroll-progress.directive';

const FIRST = 0.08;
const STEP = 0.04;
const ANSWER = 0.7;

@Component({
  selector: 'docs-landing-questions',
  imports: [RouterLink, TxButton, DocsScrollProgress],
  template: `
    <section class="questions" docsScrollProgress="sticky" aria-labelledby="questions-title" [class.questions--answered]="answered()">
      <div class="questions__stage">
        <div class="questions__panel">
          <span class="questions__blob questions__blob--one" aria-hidden="true"></span>
          <span class="questions__blob questions__blob--two" aria-hidden="true"></span>
          <span class="questions__blob questions__blob--three" aria-hidden="true"></span>
          <h2 class="questions__title" id="questions-title">
            <span class="questions__start">Every new admin app</span>
            <span class="questions__end">starts with the same questions</span>
          </h2>
          <div class="questions__cloud">
            <span class="questions__paren" aria-hidden="true">(</span>
            <ul class="questions__chips">
              @for (question of questions; track question; let index = $index) {
                <li class="chip" [class.chip--on]="shown() > index" [style.--i]="index">
                  {{ question }}
                </li>
              }
            </ul>
            <span class="questions__paren" aria-hidden="true">)</span>
          </div>
          <div class="questions__answer">
            <p class="questions__answer-title">That's why <span>tectra</span> exists.</p>
            <a txButton rounded size="large" routerLink="/getting-started" [attr.tabindex]="answered() ? null : -1">Get started</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './questions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingQuestions {
  private readonly scroll = viewChild.required(DocsScrollProgress);

  readonly questions = QUESTIONS;
  readonly shown = computed(() => Math.max(0, Math.floor((this.scroll().progress() - FIRST) / STEP) + 1));
  readonly answered = computed(() => this.scroll().progress() >= ANSWER);
}
