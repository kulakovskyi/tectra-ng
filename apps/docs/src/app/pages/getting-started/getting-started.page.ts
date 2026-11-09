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
import { CodeBlock } from '../../doc-ui/code-block/code-block';
import {
  INSTALL_ALL,
  INSTALL_EXTRAS,
  INSTALL_MANAGERS,
  INSTALL_NEXT,
  INSTALL_PACKAGES,
  INSTALL_REQUIREMENTS,
  INSTALL_USE_CODE,
  InstallManager,
} from '../../data/install.data';
import { PRIMARY_OPTIONS, STYLE_OPTIONS, SURFACE_OPTIONS } from '../../data/theme-options.data';
import { DocsCopyButton } from '../../doc-ui/copy/copy-button';
import { DocsThemeSettings } from '../../layout/theme-settings';

const STEPS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

@Component({
  selector: 'docs-getting-started-page',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, TxButton, TxCheckbox, TxIcon, TxSelect, TxTabs, CodeBlock, DocsCopyButton],
  templateUrl: './getting-started.page.html',
  styleUrls: ['../page.scss', './getting-started.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GettingStartedPage {
  private readonly settings = inject(DocsThemeSettings);

  readonly requirements = INSTALL_REQUIREMENTS;
  readonly packages = INSTALL_PACKAGES;
  readonly extras = INSTALL_EXTRAS;
  readonly next = INSTALL_NEXT;
  readonly useCode = INSTALL_USE_CODE;
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

  readonly command = computed(() => {
    const manager = INSTALL_MANAGERS.find((item) => item.value === (this.manager() as InstallManager)) ?? INSTALL_MANAGERS[0];
    const picked = this.picked();
    const names =
      this.mode() === 'all'
        ? [INSTALL_ALL, ...INSTALL_PACKAGES.filter((item) => item.separate && picked[item.name]).map((item) => item.name)]
        : INSTALL_PACKAGES.filter((item) => item.required || picked[item.name]).map((item) => item.name);
    return `${manager.add} ${names.join(' ')}`;
  });

  readonly themeCode = computed(() => {
    const options = [
      this.style() !== 'tectra' ? `style: '${this.style()}'` : '',
      `primary: '${this.primary()}'`,
      this.surface() !== 'ink' ? `surface: '${this.surface()}'` : '',
    ].filter(Boolean);
    return `import { provideTectra } from '@tectra-ng/core/config';
import { createTectraPreset } from '@tectra-ng/themes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTectra({ preset: createTectraPreset({ ${options.join(', ')} }) }),
  ],
};`;
  });

  included(name: string, separate = false): boolean {
    return this.mode() === 'all' && !separate ? true : name === INSTALL_PACKAGES[0].name || !!this.picked()[name];
  }

  toggle(name: string, checked: boolean): void {
    this.picked.update((picked) => ({ ...picked, [name]: checked }));
  }

  moveFocus(event: KeyboardEvent): void {
    const radio = event.currentTarget as HTMLButtonElement;
    const radios = Array.from(radio.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []);
    const current = radios.indexOf(radio);
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? radios.length - 1 : event.key in STEPS ? (current + STEPS[event.key] + radios.length) % radios.length : -1;
    if (next < 0) {
      return;
    }
    event.preventDefault();
    radios[next].focus();
    radios[next].click();
  }

  preview(): void {
    this.settings.update({ style: this.style() as TectraStyleName, primary: this.primary(), surface: this.surface() });
  }
}
