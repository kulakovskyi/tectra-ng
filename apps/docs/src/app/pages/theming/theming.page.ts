import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TxThemeMode, TxThemeService } from '@tectra-ng/core/config';
import { TxIcon } from '@tectra-ng/icons';
import { Tectra, TectraStyleName, toCssVariables } from '@tectra-ng/themes';
import { TectraPrimary, TectraSurface } from '@tectra-ng/tokens';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMessage } from '@tectra-ng/ui/message';
import { TxProgressBar } from '@tectra-ng/ui/progress-bar';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';
import { TxTag } from '@tectra-ng/ui/tag';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { PRIMARY_OPTIONS, STYLE_OPTIONS, SURFACE_OPTIONS } from '../../data/theme-options.data';
import { THEMING_LAYERS, THEMING_NEXT, THEMING_RECIPES, THEMING_STYLE_NOTES } from '../../data/theming.data';
import { DocsCodeCard } from '../../doc-ui/code-card/code-card';
import { DocsClipboard } from '../../doc-ui/copy/clipboard.service';
import { DocsSwatches } from '../../doc-ui/swatches/swatches';
import { DocsThemeSettings } from '../../layout/theme-settings';

interface TokenRow {
  name: string;
  light: string;
  dark: string;
}

interface TokenGroup {
  key: string;
  title: string;
  shadow: boolean;
  rows: TokenRow[];
}

const PRIMARY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SURFACE_STEPS = [0, ...PRIMARY_STEPS];
const GROUP_TITLES: Record<string, string> = { focusRing: 'Focus ring' };

const kebab = (value: string) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const title = (value: string) => GROUP_TITLES[value] ?? value.charAt(0).toUpperCase() + value.slice(1);

@Component({
  selector: 'docs-theming-page',
  imports: [
    FormsModule,
    RouterLink,
    TxIcon,
    TxAvatar,
    TxButton,
    TxCheckbox,
    TxField,
    TxInput,
    TxMessage,
    TxProgressBar,
    TxSelect,
    TxTabs,
    TxTag,
    TxToggleSwitch,
    DocsCodeCard,
    DocsSwatches,
  ],
  templateUrl: './theming.page.html',
  styleUrls: ['../page.scss', '../guide.scss', './theming.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ThemingPage {
  private readonly theme = inject(TxThemeService);
  private readonly clipboard = inject(DocsClipboard);
  protected readonly settings = inject(DocsThemeSettings);

  readonly styles: TxTabItem[] = STYLE_OPTIONS;
  readonly primaries = PRIMARY_OPTIONS;
  readonly surfaces = SURFACE_OPTIONS;
  readonly modes: TxTabItem[] = [
    { value: 'light', label: 'Light', icon: 'sun' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
  ];
  readonly styleNotes = THEMING_STYLE_NOTES;
  readonly layers = THEMING_LAYERS;
  readonly recipes = THEMING_RECIPES;
  readonly next = THEMING_NEXT;
  readonly primarySteps = PRIMARY_STEPS;
  readonly surfaceSteps = SURFACE_STEPS;
  readonly instanceTokens = { root: { borderRadius: '999px' } };

  readonly plans = ['Free', 'Team', 'Business'];
  name = 'Alex Morgan';
  plan = 'Team';
  updates = true;
  digest = false;
  readonly section = signal<TxTabValue | undefined>('profile');
  readonly sections: TxTabItem[] = [
    { value: 'profile', label: 'Profile' },
    { value: 'billing', label: 'Billing' },
    { value: 'team', label: 'Team' },
  ];

  readonly query = signal('');

  readonly presetCode = computed(() => {
    const options = [
      this.settings.style() !== 'tectra' ? `style: '${this.settings.style()}'` : '',
      this.settings.primary() !== 'blue' ? `primary: '${this.settings.primary()}'` : '',
      this.settings.surface() !== 'ink' ? `surface: '${this.settings.surface()}'` : '',
    ].filter(Boolean);
    const lines = [
      `preset: ${options.length ? `createTectraPreset({ ${options.join(', ')} })` : 'Tectra'},`,
      this.settings.mode() === 'dark' ? `mode: 'dark',` : '',
      this.settings.ripple() ? 'ripple: true,' : '',
    ].filter(Boolean);
    const imports = options.length ? 'createTectraPreset' : 'Tectra';
    return `import { provideTectra } from '@tectra-ng/core/config';
import { ${imports} } from '@tectra-ng/themes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTectra({
${lines.map((line) => `      ${line}`).join('\n')}
    }),
  ],
};`;
  });

  readonly isDefault = computed(
    () => this.settings.style() === 'tectra' && this.settings.primary() === 'blue' && this.settings.surface() === 'ink',
  );

  readonly groups = computed<TokenGroup[]>(() => {
    const preset = this.theme.preset() ?? Tectra;
    const query = this.query().trim().toLowerCase();
    return Object.keys(preset.light)
      .map((key) => {
        const prefix = `--tx-${kebab(key)}`;
        const light = toCssVariables(preset.light[key as keyof typeof preset.light], prefix);
        const dark = toCssVariables(preset.dark[key as keyof typeof preset.dark], prefix);
        const rows = light
          .map((variable, index) => ({ name: variable.name, light: variable.value, dark: dark[index]?.value ?? variable.value }))
          .filter((row) => !query || row.name.includes(query) || row.light.toLowerCase().includes(query));
        return { key, title: title(key), shadow: key === 'shadow', rows };
      })
      .filter((group) => group.rows.length);
  });

  readonly tokenCount = computed(() => this.groups().reduce((sum, group) => sum + group.rows.length, 0));

  setStyle(value: TxTabValue | undefined): void {
    if (value) {
      this.settings.update({ style: value as TectraStyleName });
    }
  }

  setMode(value: TxTabValue | undefined): void {
    if (value && (value as TxThemeMode) !== this.settings.mode()) {
      this.settings.toggleMode();
    }
  }

  setPrimary(value: TectraPrimary | undefined): void {
    if (value) {
      this.settings.update({ primary: value });
    }
  }

  setSurface(value: TectraSurface | undefined): void {
    if (value) {
      this.settings.update({ surface: value });
    }
  }

  reset(): void {
    this.settings.update({ style: 'tectra', primary: 'blue', surface: 'ink' });
  }

  copyVariable(name: string): void {
    this.clipboard.copy(`var(${name})`, `Copied var(${name})`);
  }
}
