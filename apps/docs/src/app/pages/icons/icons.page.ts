import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TX_BRAND_ICONS, TxBrandIconName } from '@tectra-ng/brand-icons';
import { TX_ICONS, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'docs-icons-page',
  imports: [TxIcon, TxInput],
  templateUrl: './icons.page.html',
  styleUrls: ['../page.scss', './icons.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconsPage {
  readonly names = Object.keys(TX_ICONS) as TxIconName[];
  readonly brandNames = Object.keys(TX_BRAND_ICONS) as TxBrandIconName[];

  query = signal('');
  strokeWidth = signal(1.75);
  copied = signal<string | null>(null);

  visibleNames = computed(() => this.filterNames(this.names));
  visibleBrandNames = computed(() => this.filterNames(this.brandNames));

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onStrokeWidth(event: Event): void {
    this.strokeWidth.set(Number((event.target as HTMLInputElement).value));
  }

  copyName(name: string): void {
    navigator.clipboard?.writeText(name);
    this.copied.set(name);
  }

  private filterNames<T extends string>(names: T[]): T[] {
    const query = this.query().trim().toLowerCase();
    return query ? names.filter((name) => name.includes(query)) : names;
  }
}
