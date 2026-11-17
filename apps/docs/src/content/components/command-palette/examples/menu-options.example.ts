import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxCommandPalette, menuPaletteItems } from '@tectra-ng/blocks/command-palette';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

const MENU: TxPanelMenuItem[] = [
  {
    label: 'nav.main',
    items: [
      { label: 'nav.dashboard', icon: 'speedometer', routerLink: '/dashboard' },
      { label: 'nav.invoices', icon: 'receipt', routerLink: '/invoices' },
    ],
  },
  {
    label: 'nav.settings',
    items: [
      { label: 'nav.team', icon: 'people', routerLink: '/settings/team' },
      { label: 'nav.billing', routerLink: '/settings/billing' },
    ],
  },
];

const TEXTS: Record<string, Record<string, string>> = {
  en: {
    'nav.main': 'Main',
    'nav.dashboard': 'Dashboard',
    'nav.invoices': 'Invoices',
    'nav.settings': 'Settings',
    'nav.team': 'Team',
    'nav.billing': 'Billing',
  },
  de: {
    'nav.main': 'Start',
    'nav.dashboard': 'Übersicht',
    'nav.invoices': 'Rechnungen',
    'nav.settings': 'Einstellungen',
    'nav.team': 'Team',
    'nav.billing': 'Abrechnung',
  },
};

const ICONS = { speedometer: 'gauge', receipt: 'file', people: 'users' };

@Component({
  selector: 'command-palette-menu-options-example',
  imports: [TxCommandPalette, TxTabs],
  template: `
    <div class="row">
      <tx-tabs variant="pills" ariaLabel="Language" [tabs]="languages" [(value)]="language" />
      <tx-command-palette
        localFilter
        shortcutKey="e"
        [label]="language() === 'de' ? 'Suchen' : 'Search'"
        [items]="items()"
        [groupLabels]="{ pages: language() === 'de' ? 'Seiten' : 'Pages' }"
        [hintTexts]="language() === 'de' ? germanHints : {}"
        (itemSelect)="last.set($event.label)"
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
export default class CommandPaletteMenuOptionsExample {
  readonly germanHints = { navigate: 'blättern', open: 'öffnen', close: 'schließen' };
  readonly languages: TxTabItem[] = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
  ];
  readonly language = signal<TxTabValue | undefined>('en');
  readonly last = signal('nothing yet');
  readonly items = computed(() => {
    const texts = TEXTS[String(this.language())] ?? TEXTS['en'];
    return menuPaletteItems(MENU, {
      translate: (key) => texts[key] ?? key,
      icon: ICONS,
      defaultIcon: 'credit-card',
    }).map((item) => ({ ...item, routerLink: undefined }));
  });
}
