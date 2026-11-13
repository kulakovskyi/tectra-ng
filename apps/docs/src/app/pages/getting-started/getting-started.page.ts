import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TxIcon } from '@tectra-ng/icons';
import { TectraStyleName } from '@tectra-ng/themes';
import { TectraPrimary, TectraSurface } from '@tectra-ng/tokens';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';
import { DocsCodeCard } from '../../doc-ui/code-card/code-card';
import { DocsSwatches } from '../../doc-ui/swatches/swatches';
import {
  INSTALL_ALL,
  INSTALL_EXTRAS,
  INSTALL_KIT,
  INSTALL_MANAGERS,
  INSTALL_NEXT,
  INSTALL_NG_ADD,
  INSTALL_PACKAGES,
  INSTALL_REQUIREMENTS,
  INSTALL_STRICT_NOTE,
  INSTALL_USE_CODE,
  InstallManager,
} from '../../data/install.data';
import { PRIMARY_OPTIONS, STYLE_OPTIONS, SURFACE_OPTIONS } from '../../data/theme-options.data';
import { DocsCopyButton } from '../../doc-ui/copy/copy-button';
import { DocsThemeSettings } from '../../layout/theme-settings';


@Component({
  selector: 'docs-getting-started-page',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, TxButton, TxCheckbox, TxIcon, TxSelect, TxTabs, DocsCodeCard, DocsCopyButton, DocsSwatches],
  templateUrl: './getting-started.page.html',
  styleUrls: ['../page.scss', '../guide.scss', './getting-started.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GettingStartedPage {
  private readonly settings = inject(DocsThemeSettings);

  readonly requirements = INSTALL_REQUIREMENTS;
  readonly packages = INSTALL_PACKAGES;
  readonly extras = INSTALL_EXTRAS;
  readonly next = INSTALL_NEXT;
  readonly useCode = INSTALL_USE_CODE;
  readonly ngAdd = INSTALL_NG_ADD;
  readonly strictNote = INSTALL_STRICT_NOTE;
  readonly managers: TxTabItem[] = INSTALL_MANAGERS.map(({ value, label }) => ({ value, label }));
  readonly modes: TxTabItem[] = [
    { value: 'all', label: 'Everything' },
    { value: 'pick', label: 'Pick packages' },
  ];
  readonly styles: TxTabItem[] = STYLE_OPTIONS;
  readonly primaries = PRIMARY_OPTIONS;
  readonly surfaces = SURFACE_OPTIONS;
  readonly cities = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv'];
  readonly city = new FormControl<string | null>(null);

  readonly manager = signal<TxTabValue | undefined>('npm');
  readonly mode = signal<TxTabValue | undefined>('all');
  readonly picked = signal<Record<string, boolean>>({ '@tectra-ng/blocks': true });
  readonly style = signal<TxTabValue | undefined>('tectra');
  readonly primary = signal<TectraPrimary>('blue');
  readonly surface = signal<TectraSurface>('ink');

  readonly managerOption = computed(() => INSTALL_MANAGERS.find((item) => item.value === (this.manager() as InstallManager)) ?? INSTALL_MANAGERS[0]);

  readonly command = computed(() => {
    const manager = this.managerOption();
    const picked = this.picked();
    const separate = INSTALL_PACKAGES.filter((item) => item.separate && picked[item.name]).map((item) => item.name);
    const names =
      this.mode() === 'all'
        ? [INSTALL_ALL, ...(manager.strict ? INSTALL_KIT : []), ...separate]
        : INSTALL_PACKAGES.filter((item) => item.required || picked[item.name]).flatMap((item) => [item.name, ...(item.with ?? [])]);
    return `${manager.add} ${names.join(' ')}`;
  });

  readonly themeCode = computed(() => {
    const options = [
      this.style() !== 'tectra' ? `style: ${this.style()}Style` : '',
      `primary: '${this.primary()}'`,
      this.surface() !== 'ink' ? `surface: '${this.surface()}'` : '',
    ].filter(Boolean);
    return `import { provideTectra } from '@tectra-ng/core/config';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';
import { ${['createTectraPreset', this.style() !== 'tectra' ? `${this.style()}Style` : ''].filter(Boolean).join(', ')} } from '@tectra-ng/themes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTectra({ preset: createTectraPreset({ ${options.join(', ')} }) }),
    provideTxIcons(TX_ICONS),
  ],
};`;
  });

  included(name: string, separate = false): boolean {
    return this.mode() === 'all' && !separate ? true : name === INSTALL_PACKAGES[0].name || !!this.picked()[name];
  }

  toggle(name: string, checked: boolean): void {
    this.picked.update((picked) => ({ ...picked, [name]: checked }));
  }

  preview(): void {
    this.settings.update({ style: this.style() as TectraStyleName, primary: this.primary(), surface: this.surface() });
  }
}
