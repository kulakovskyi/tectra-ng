import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TxThemeReveal } from '@tectra-ng/blocks/switch-theme';
import { TectraStyleName } from '@tectra-ng/themes';
import { ACCENT_PALETTES, SURFACE_PALETTES, TectraPrimary } from '@tectra-ng/tokens';
import { TxButton } from '@tectra-ng/ui/button';
import { TxProgressBar } from '@tectra-ng/ui/progress-bar';
import { TxTag } from '@tectra-ng/ui/tag';
import { DocsThemeSettings } from '../../layout/theme-settings';

const PRIMARIES: TectraPrimary[] = ['blue', 'violet', 'emerald', 'orange', 'rose', 'cyan', 'amber', 'noir'];
const STYLES: TectraStyleName[] = ['tectra', 'soft', 'edge', 'paper'];

@Component({
  selector: 'docs-landing-theme-demo',
  imports: [TxButton, TxProgressBar, TxTag, TxThemeReveal],
  templateUrl: './theme-demo.html',
  styleUrl: './theme-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingThemeDemo {
  protected readonly settings = inject(DocsThemeSettings);

  readonly styles = STYLES;
  readonly primaries = PRIMARIES.map((name) => ({
    name,
    color: name === 'noir' ? SURFACE_PALETTES.ink[900] : ACCENT_PALETTES[name][500],
  }));
  readonly dark = computed(() => this.settings.mode() === 'dark');
}
