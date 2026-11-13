import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TX_FLAG_CODES } from '@tectra-ng/flags';
import { TX_ICONS } from '@tectra-ng/icons';
import { COMPONENT_TOKENS, Tectra, toCssVariables } from '@tectra-ng/themes';
import { DOC_COMPONENTS } from '../../../generated/registry';
import { LandingShapeKind, LandingTone } from '../landing.types';
import { LandingShape } from '../parts/shape';
import { DocsScrollProgress } from '../scroll-progress.directive';

interface LandingStat {
  value: number;
  suffix: string;
  label: string;
  tone: LandingTone;
  shape: LandingShapeKind;
}

@Component({
  selector: 'docs-landing-stats',
  imports: [LandingShape, DocsScrollProgress],
  template: `
    <section class="stats" aria-labelledby="stats-title">
      <div class="stats__frame">
        <h2 class="stats__title" id="stats-title">Big where it counts.<br /><span>Light where it matters.</span></h2>
        <div class="stats__grid" docsScrollProgress="view" #counter="scrollProgress">
          @for (stat of stats; track stat.label; let index = $index) {
            <div class="stat" [attr.data-tone]="stat.tone" [style.--i]="index">
              <span class="stat__value">{{ count(stat.value, counter.progress()) }}{{ stat.suffix }}</span>
              <span class="stat__label">{{ stat.label }}</span>
              <docs-landing-shape class="stat__shape" tone="ink" [kind]="stat.shape" />
            </div>
          }
        </div>
        <p class="stats__note">
          Built on Angular and its CDK alone, with no third-party UI library underneath. Every component is its own entry point, so an app ships only what it imports.
        </p>
      </div>
    </section>
  `,
  styleUrl: './stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingStats {
  readonly stats: LandingStat[] = [
    {
      value: DOC_COMPONENTS.length,
      suffix: '+',
      label: 'components and blocks',
      tone: 'sky',
      shape: 'arch',
    },
    {
      value: Object.keys(TX_ICONS).length,
      suffix: '',
      label: 'icons in one style',
      tone: 'amber',
      shape: 'circle',
    },
    {
      value: TX_FLAG_CODES.length,
      suffix: '',
      label: 'country flags',
      tone: 'green',
      shape: 'quarter',
    },
    {
      value: toCssVariables(Tectra.light).length + toCssVariables(COMPONENT_TOKENS).length,
      suffix: '+',
      label: 'design tokens',
      tone: 'purple',
      shape: 'leaf',
    },
  ];

  count(value: number, progress: number): string {
    const eased = 1 - Math.pow(1 - progress, 3);
    return Math.round(value * eased).toLocaleString('en-US');
  }
}
