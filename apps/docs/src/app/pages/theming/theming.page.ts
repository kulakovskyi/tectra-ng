import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxThemeService } from '@tectra/core/config';
import { InkPreset, createInkPreset, toCssVariables } from '@tectra/themes';
import { TectraAccent } from '@tectra/tokens';
import { TxSelect } from '@tectra/ui/select';
import { THEME_ACCENTS } from '../../data/theme-accents.data';

@Component({
  selector: 'docs-theming-page',
  imports: [TxSelect, ReactiveFormsModule],
  templateUrl: './theming.page.html',
  styleUrls: ['../page.scss', './theming.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ThemingPage {
  private txThemeService = inject(TxThemeService);

  readonly accents = THEME_ACCENTS;
  readonly mode = this.txThemeService.mode;
  accentControl = new FormControl<TectraAccent>(this.currentAccent(), { nonNullable: true });

  variables = computed(() => {
    const preset = this.txThemeService.preset() ?? InkPreset;
    return toCssVariables(this.mode() === 'light' ? preset.light : preset.dark);
  });

  constructor() {
    this.accentControl.valueChanges.subscribe((accent) => this.txThemeService.applyPreset(createInkPreset(accent)));
  }

  private currentAccent(): TectraAccent {
    const name = this.txThemeService.preset()?.name ?? InkPreset.name;
    return name.replace('ink-', '') as TectraAccent;
  }
}
