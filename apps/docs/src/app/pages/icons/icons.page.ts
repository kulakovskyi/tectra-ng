import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TX_BRAND_COLORS, TX_BRAND_ICONS, TX_BRAND_TITLES, TxBrandIconName } from '@tectra-ng/brand-icons';
import { TX_ICONS, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TX_COUNTRY_CODES, TxCountry, TxFlagShape, countryName } from '@tectra-ng/ui/country';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSlider } from '@tectra-ng/ui/slider';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { ICON_NEXT, ICON_RECIPES } from '../../data/icons.data';
import { DocsCodeCard } from '../../doc-ui/code-card/code-card';
import { DocsCopyButton } from '../../doc-ui/copy/copy-button';
import { DocsClipboard } from '../../doc-ui/copy/clipboard.service';
import { DocsThemeSettings } from '../../layout/theme-settings';

type IconsTab = 'icons' | 'brands' | 'flags';

interface IconTile {
  name: string;
  label: string;
  color: string | null;
}

interface FlagTile {
  code: string;
  name: string;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r, g, b] = channels.map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

@Component({
  selector: 'docs-icons-page',
  imports: [
    FormsModule,
    RouterLink,
    TxIcon,
    TxCountry,
    TxIconField,
    TxInputClear,
    TxInputIcon,
    TxInput,
    TxSlider,
    TxTabs,
    TxToggleSwitch,
    DocsCodeCard,
    DocsCopyButton,
  ],
  templateUrl: './icons.page.html',
  styleUrls: ['../page.scss', '../guide.scss', './icons.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconsPage {
  private readonly clipboard = inject(DocsClipboard);
  private readonly settings = inject(DocsThemeSettings);

  readonly recipes = ICON_RECIPES;
  readonly next = ICON_NEXT;
  readonly shapeTabs: TxTabItem[] = [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
  ];

  readonly icons = Object.keys(TX_ICONS) as TxIconName[];
  readonly brands = Object.keys(TX_BRAND_ICONS) as TxBrandIconName[];
  readonly flags: FlagTile[] = TX_COUNTRY_CODES.map((code) => ({ code: code.toLowerCase(), name: countryName(code, 'en') })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  readonly tabs: TxTabItem[] = [
    { value: 'icons', label: 'Icons' },
    { value: 'brands', label: 'Brands' },
    { value: 'flags', label: 'Flags' },
  ];

  readonly tab = signal<IconsTab>('icons');
  readonly query = signal('');
  readonly stroke = signal(1.75);
  readonly brandColors = signal(false);
  readonly shape = signal<TxFlagShape>('rectangle');
  readonly selected = signal<string>('palette');

  private readonly needle = computed(() => this.query().trim().toLowerCase());

  readonly iconTiles = computed<IconTile[]>(() => {
    const needle = this.needle();
    return this.icons.filter((name) => !needle || name.includes(needle)).map((name) => ({ name, label: name, color: null }));
  });

  readonly brandTiles = computed<IconTile[]>(() => {
    const needle = this.needle();
    const dark = this.settings.mode() === 'dark';
    return this.brands
      .filter((name) => !needle || name.includes(needle) || TX_BRAND_TITLES[name].toLowerCase().includes(needle))
      .map((name) => {
        const color = TX_BRAND_COLORS[name];
        return { name, label: this.brandLabel(name), color: dark && luminance(color) < 0.06 ? null : color };
      });
  });

  readonly flagTiles = computed(() => {
    const needle = this.needle();
    return this.flags.filter((flag) => !needle || flag.code === needle || flag.name.toLowerCase().includes(needle));
  });

  readonly tiles = computed(() => (this.tab() === 'brands' ? this.brandTiles() : this.iconTiles()));

  readonly selectedColor = computed(() =>
    this.brandColors() ? (this.brandTiles().find((tile) => tile.name === this.selected())?.color ?? null) : null,
  );

  readonly selectedLabel = computed(() => {
    const name = this.selected();
    if (name in TX_BRAND_TITLES) {
      return this.brandLabel(name as TxBrandIconName);
    }
    const words = name.replace(/-/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  });
  readonly selectedCode = computed(() => {
    return `<tx-icon name="${this.selected()}" />`;
  });

  private brandLabel(name: TxBrandIconName): string {
    const title = TX_BRAND_TITLES[name];
    const shared = this.brands.some((other) => other !== name && TX_BRAND_TITLES[other] === title);
    return shared && title.toLowerCase() !== name ? name.charAt(0).toUpperCase() + name.slice(1) : title;
  }

  setTab(value: TxTabValue | undefined): void {
    if (value === 'icons' || value === 'brands' || value === 'flags') {
      this.tab.set(value);
      if (value === 'icons' && !this.icons.includes(this.selected() as TxIconName)) {
        this.selected.set('palette');
      }
      if (value === 'brands' && !this.brands.includes(this.selected() as TxBrandIconName)) {
        this.selected.set('github');
      }
    }
  }

  setShape(value: TxTabValue | undefined): void {
    if (value === 'rectangle' || value === 'circle') {
      this.shape.set(value);
    }
  }

  pick(name: string): void {
    this.selected.set(name);
    this.clipboard.copy(name, `Copied “${name}”`);
  }

  copyFlag(flag: FlagTile): void {
    this.clipboard.copy(flag.code, `Copied “${flag.code}” — ${flag.name}`);
  }
}
