import { ChangeDetectionStrategy, Component, computed, inject, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxIcon } from '@tectra-ng/icons';
import { DocsThemeSettings } from '../../layout/theme-settings';
import { LandingChartDemo } from '../demos/chart-demo';
import { LandingFormDemo } from '../demos/form-demo';
import { LandingTableDemo } from '../demos/table-demo';
import { LandingThemeDemo } from '../demos/theme-demo';
import { FEATURES } from '../landing.data';
import { DocsScrollProgress } from '../scroll-progress.directive';

const STICKY_TOP = 84;
const STICKY_STEP = 14;

@Component({
  selector: 'docs-landing-features',
  imports: [RouterLink, TxIcon, DocsScrollProgress, LandingTableDemo, LandingFormDemo, LandingChartDemo, LandingThemeDemo],
  templateUrl: './features.html',
  styleUrl: './features.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFeatures {
  private readonly settings = inject(DocsThemeSettings);

  readonly features = FEATURES;
  readonly total = String(FEATURES.length).padStart(2, '0');
  readonly mode = computed(() => (this.settings.mode() === 'dark' ? 'dark' : 'light'));

  private readonly cards = viewChildren(DocsScrollProgress);
  readonly covered = computed(() => this.cards().map((_, index, cards) => cards[index + 1]?.progress() ?? 0));

  stickyTop(index: number): number {
    return STICKY_TOP + index * STICKY_STEP;
  }

  number(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
