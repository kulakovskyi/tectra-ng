import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, input, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxAppLayout } from '@tectra-ng/blocks/app-layout';
import { TxCommandPalette } from '@tectra-ng/blocks/command-palette';
import { TxFilterField, TxFiltersPanel } from '@tectra-ng/blocks/filters-panel';
import { TxKanban, TxKanbanCard } from '@tectra-ng/blocks/kanban';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxEditor } from '@tectra-ng/editor';
import { TxThemeService } from '@tectra-ng/core/config';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxMonthCalendar } from '@tectra-ng/ui/month-calendar';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { STUDIO_BOARD, STUDIO_CUSTOMERS, STUDIO_DOCUMENT, STUDIO_EVENTS, STUDIO_PALETTE, StudioTask } from './studio.data';

@Component({
  selector: 'docs-studio-page',
  imports: [
    FormsModule,
    TxAppLayout,
    TxCommandPalette,
    TxFiltersPanel,
    TxFilterField,
    TxKanban,
    TxKanbanCard,
    TxPageHeader,
    TxEditor,
    TxAvatar,
    TxButton,
    TxIconField,
    TxInputIcon,
    TxInput,
    TxLabel,
    TxMonthCalendar,
    TxPill,
    TxSelect,
    TxStatTiles,
    TxStatTile,
    TxTable,
    TxTableCell,
  ],
  templateUrl: './studio.page.html',
  styleUrl: './studio.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StudioPage {
  private readonly theme = inject(TxThemeService);
  private readonly palette = viewChild(TxCommandPalette);

  readonly scene = input('overview');
  readonly mode = input<string | undefined>(undefined);

  readonly customers = STUDIO_CUSTOMERS;
  readonly board = STUDIO_BOARD;
  readonly events = STUDIO_EVENTS;
  readonly paletteItems = STUDIO_PALETTE;
  readonly document = STUDIO_DOCUMENT;
  readonly month = new Date(2026, 10, 1);
  readonly today = new Date(2026, 10, 12);
  readonly taskId = (task: StudioTask) => task.id;
  readonly plans = ['Starter', 'Pro', 'Business'].map((plan) => ({ label: plan, value: plan }));
  readonly statuses = ['Active', 'Trial', 'Overdue', 'Paused'].map((status) => ({ label: status, value: status }));
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Customer' },
    { field: 'plan', header: 'Plan' },
    { field: 'status', header: 'Status' },
    { field: 'seats', header: 'Seats', align: 'end' },
    { field: 'mrr', header: 'MRR', align: 'end' },
  ];

  readonly page = computed(() => ({ overview: 'Customers', palette: 'Customers', board: 'Roadmap', editor: 'Documents', calendar: 'Calendar' })[this.scene()] ?? 'Customers');
  readonly menu = computed<TxPanelMenuItem[]>(() => [
    {
      label: 'Workspace',
      items: [
        this.link('Overview', 'home'),
        this.link('Customers', 'users'),
        { ...this.link('Roadmap', 'objects-column'), badge: 3 },
        this.link('Documents', 'file'),
        this.link('Calendar', 'calendar'),
      ],
    },
    {
      label: 'Account',
      items: [this.link('Billing', 'credit-card'), this.link('Team', 'user-plus'), this.link('Settings', 'cog')],
    },
  ]);

  constructor() {
    afterNextRender(() => {
      this.theme.setMode(this.mode() === 'dark' ? 'dark' : 'light');
      if (this.scene() === 'palette') {
        this.palette()?.open();
      }
    });
  }

  private link(label: string, icon: string): TxPanelMenuItem {
    return { label, icon, active: this.page() === label };
  }
}
