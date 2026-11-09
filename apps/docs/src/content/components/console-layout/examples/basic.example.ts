import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxAppFooterLink } from '@tectra-ng/blocks/app-footer';
import { TxConsoleLayout, TxConsoleRailItem } from '@tectra-ng/blocks/console-layout';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

type Section = 'overview' | 'domains' | 'reports' | 'settings';

const SECTIONS: Record<Section, { label: string; icon: string; subtitle: string }> = {
  overview: { label: 'Overview', icon: 'home', subtitle: 'How your sites did this week' },
  domains: { label: 'Domains', icon: 'globe', subtitle: '4 domains in this project' },
  reports: { label: 'Reports', icon: 'chart-bar', subtitle: 'Scheduled and one-off reports' },
  settings: { label: 'Settings', icon: 'cog', subtitle: 'Project name, members and limits' },
};

@Component({
  selector: 'console-layout-basic-example',
  imports: [TxConsoleLayout, TxPageHeader, TxEmptyState, TxButton, TxCard, TxTable, TxTooltip],
  template: `
    <div class="screen">
      <tx-console-layout
        title="Search"
        titleMuted="console"
        logo="/favicon.svg"
        footerName="Search console"
        [crumbs]="['Website', current().label]"
        [railItems]="railItems()"
        [footerLinks]="footerLinks"
        [dt]="{ root: { minHeight: '100%', viewportHeight: '558px' } }"
      >
        <button
          txButton
          txConsoleApps
          text
          severity="secondary"
          icon="th-large"
          aria-label="Apps"
          txTooltip="Apps"
        ></button>
        <div txConsoleActions class="actions">
          <button
            txButton
            text
            severity="secondary"
            icon="bell"
            aria-label="Notifications"
            txTooltip="Notifications"
          ></button>
          <button
            txButton
            text
            severity="secondary"
            icon="user"
            aria-label="Account"
            txTooltip="Account"
          ></button>
        </div>
        <tx-page-header class="header" [title]="current().label" [subtitle]="current().subtitle" />
        @switch (section()) {
          @case ('overview') {
            <div class="cards">
              <tx-card title="12 480" subtitle="Visits" />
              <tx-card title="3.4%" subtitle="Click rate" />
              <tx-card title="27" subtitle="New pages" />
            </div>
          }
          @case ('domains') {
            <tx-table ariaLabel="Domains" dataKey="name" [value]="domains" [columns]="columns" />
          }
          @case ('reports') {
            <tx-empty-state
              variant="framed"
              icon="chart-bar"
              title="No reports yet"
              text="Schedule a report and it lands here every week."
            >
              <button txButton icon="plus">New report</button>
            </tx-empty-state>
          }
          @default {
            <tx-card title="Website" subtitle="Created 2 March · 3 members" />
          }
        }
      </tx-console-layout>
    </div>
  `,
  styles: `
    .screen {
      width: 100%;
      height: 560px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
    }

    .actions {
      display: flex;
      gap: 4px;
    }

    .header {
      margin-bottom: 20px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConsoleLayoutBasicExample {
  readonly section = signal<Section>('overview');
  readonly current = computed(() => SECTIONS[this.section()]);
  readonly railItems = computed<TxConsoleRailItem[]>(() =>
    (Object.keys(SECTIONS) as Section[]).map((key) => ({
      label: SECTIONS[key].label,
      icon: SECTIONS[key].icon,
      active: key === this.section(),
      command: () => this.section.set(key),
    })),
  );
  readonly footerLinks: TxAppFooterLink[] = [
    { label: 'Privacy', url: 'https://example.com/privacy', target: '_blank' },
    { label: 'Terms', url: 'https://example.com/terms', target: '_blank' },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Domain' },
    { field: 'pages', header: 'Pages' },
    { field: 'status', header: 'Status' },
  ];
  readonly domains = [
    { name: 'example.com', pages: 1240, status: 'Live' },
    { name: 'shop.example.com', pages: 380, status: 'Live' },
    { name: 'blog.example.com', pages: 96, status: 'Paused' },
    { name: 'docs.example.com', pages: 210, status: 'Live' },
  ];
}
