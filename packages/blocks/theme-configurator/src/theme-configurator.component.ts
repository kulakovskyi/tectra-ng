import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, inject, input, numberAttribute, output, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions, TxThemeChoice, TxThemeService } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import {
  TectraDeepPartial,
  TectraPresetSource,
  TectraPrimary,
  TectraStyle,
  TectraSurface,
  TectraThemeConfiguratorTokens,
  tectraPrimaryChoices,
  tectraSurfaceChoices,
  toStyleObject,
} from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';
import { TxColorSwatchOption, TxColorSwatches } from '@tectra-ng/ui/color-swatches';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { TxThemeConfiguratorPart } from './theme-configurator.types';
import { THEME_CONFIGURATOR_THEME } from './theme-configurator.theme';

const STEPS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const ALL_PRIMARIES = tectraPrimaryChoices();
const ALL_SURFACES = tectraSurfaceChoices();

/** Theme settings at run time: primary color, surface palette, style and ripple, applied through `TxThemeService`. */
@Component({
  selector: 'tx-theme-configurator',
  imports: [FormsModule, TxButton, TxButtonGroup, TxColorSwatches, TxToggleSwitch],
  templateUrl: './theme-configurator.component.html',
  styleUrl: './theme-configurator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-theme-configurator',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxThemeConfigurator {
  private readonly themeConfiguratorTheme = injectTokens(THEME_CONFIGURATOR_THEME);

  protected readonly theme = inject(TxThemeService);

  readonly styles = input<readonly TectraStyle[]>([]);
  readonly primaries = input<readonly TxColorSwatchOption<TectraPrimary>[]>(ALL_PRIMARIES);
  readonly surfaces = input<readonly TxColorSwatchOption<TectraSurface>[]>(ALL_SURFACES);
  readonly columns = input<number, unknown>(9, { transform: numberAttribute });
  readonly showRipple = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraThemeConfiguratorTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxThemeConfiguratorPart, TxThemeConfigurator> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly themeChange = output<TectraPresetSource>();
  readonly rippleChange = output<boolean>();

  private readonly segmentButtons = viewChildren('segment', { read: ElementRef<HTMLButtonElement> });

  protected readonly id = uniqueId('tx-theme-configurator');
  protected readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('themeConfigurator', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-theme-configurator'), ...this.passThrough().root?.style }));
  protected readonly styleIndex = computed(() => this.styles().findIndex((style) => style.name === this.theme.style().name));

  update(choice: TxThemeChoice): void {
    this.theme.updateTheme(choice);
    this.themeChange.emit({ style: this.theme.style(), primary: this.theme.primary(), surface: this.theme.surface() });
  }

  setRipple(enabled: boolean): void {
    this.theme.setRipple(enabled);
    this.rippleChange.emit(enabled);
  }

  protected selectStyle(index: number): void {
    if (index !== this.styleIndex()) {
      this.update({ style: this.styles()[index] });
    }
  }

  protected onSegmentKeydown(event: KeyboardEvent, index: number): void {
    const count = this.styles().length;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : event.key in STEPS ? (index + STEPS[event.key] + count) % count : -1;
    if (next < 0) {
      return;
    }
    event.preventDefault();
    this.segmentButtons()[next].nativeElement.focus();
    this.selectStyle(next);
  }
}
