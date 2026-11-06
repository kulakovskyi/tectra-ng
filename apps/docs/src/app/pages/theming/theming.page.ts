import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TxThemeService } from '@tectra-ng/core/config';
import { Tectra, toCssVariables } from '@tectra-ng/themes';
import { CodeBlock } from '../../doc-ui/code-block/code-block';
import { ACCENT_PRESET_EXAMPLE } from '../../data/code-examples.data';
import { DocsThemeConfigurator } from '../../layout/theme-configurator/theme-configurator';

@Component({
  selector: 'docs-theming-page',
  imports: [CodeBlock, DocsThemeConfigurator],
  templateUrl: './theming.page.html',
  styleUrls: ['../page.scss', './theming.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ThemingPage {
  private txThemeService = inject(TxThemeService);

  readonly presetExample = ACCENT_PRESET_EXAMPLE;
  readonly mode = this.txThemeService.mode;

  variables = computed(() => {
    const preset = this.txThemeService.preset() ?? Tectra;
    return toCssVariables(this.mode() === 'light' ? preset.light : preset.dark);
  });
}
