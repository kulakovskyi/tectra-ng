import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TxCommandPalette, TxCommandPaletteItem } from '@tectra-ng/blocks/command-palette';

const DOMAINS = [
  'example.com',
  'shop.example.com',
  'blog.example.org',
  'docs.example.dev',
  'shopfront.net',
];

@Component({
  selector: 'command-palette-server-search-example',
  imports: [TxCommandPalette],
  template: `
    <div class="row">
      <tx-command-palette
        label="Find a domain"
        shortcutKey="i"
        placeholder="Type at least two letters"
        [items]="results()"
        [groupLabels]="{ domains: 'Domains' }"
        [loading]="searching()"
        (searchChange)="search($event)"
        (itemSelect)="last.set($event.label)"
        (closed)="results.set([])"
      />
      <span class="note">Opened: {{ last() }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommandPaletteServerSearchExample {
  private timer: ReturnType<typeof setTimeout> | undefined;
  readonly results = signal<TxCommandPaletteItem[]>([]);
  readonly searching = signal(false);
  readonly last = signal('nothing yet');

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  search(term: string): void {
    clearTimeout(this.timer);
    if (!term) {
      this.results.set([]);
      this.searching.set(false);
      return;
    }
    this.searching.set(true);
    this.timer = setTimeout(() => {
      this.searching.set(false);
      this.results.set(
        DOMAINS.filter((domain) => domain.includes(term.toLowerCase())).map((domain) => ({
          id: domain,
          group: 'domains',
          label: domain,
          sublabel: domain.split('.').pop(),
          icon: 'globe',
        })),
      );
    }, 600);
  }
}
