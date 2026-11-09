import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  TxConsoleLayout,
  TxConsolePanel,
  TxConsoleRailItem,
} from '@tectra-ng/blocks/console-layout';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';

const PROJECTS = ['Website', 'Shop', 'Blog'];

@Component({
  selector: 'console-layout-panel-example',
  imports: [TxConsoleLayout, TxConsolePanel, TxPageHeader, TxPanelMenu, TxTable],
  template: `
    <div class="screen">
      <tx-console-layout
        title="Search"
        titleMuted="console"
        logo="/favicon.svg"
        footerName="Search console"
        [crumbs]="['Projects', project()]"
        [railItems]="railItems"
        [dt]="{ root: { minHeight: '100%', viewportHeight: '558px' } }"
      >
        <tx-console-panel label="Projects">
          <tx-panel-menu
            txConsolePanelAside
            variant="sidebar"
            ariaLabel="Projects"
            [model]="menu()"
            [dt]="{
              root: { fontSize: '12.25px' },
              sidebar: {
                sectionPadding: '0 3.5px 10.5px',
                sectionFontSize: '10.5px',
                itemMargin: '1.75px 0',
                itemPadding: '7px',
              },
            }"
          />
          <tx-page-header class="header" [title]="project()" subtitle="Pages found this week" />
          <tx-table ariaLabel="Pages" dataKey="path" [value]="pages()" [columns]="columns" />
        </tx-console-panel>
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

    .header {
      margin-bottom: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConsoleLayoutPanelExample {
  readonly project = signal(PROJECTS[0]);
  readonly railItems: TxConsoleRailItem[] = [
    { label: 'Projects', icon: 'folder', active: true },
    { label: 'Reports', icon: 'chart-bar' },
    { label: 'Settings', icon: 'cog' },
  ];
  readonly menu = computed<TxPanelMenuItem[]>(() => [
    {
      label: 'Projects',
      items: PROJECTS.map((name) => ({
        label: name,
        icon: 'folder',
        active: name === this.project(),
        command: () => this.project.set(name),
      })),
    },
  ]);
  readonly columns: TxTableColumn[] = [
    { field: 'path', header: 'Page' },
    { field: 'visits', header: 'Visits' },
  ];
  readonly pages = computed(() =>
    ['/', '/pricing', '/about', '/contact'].map((path, index) => ({
      path: `${this.project().toLowerCase()}.example.com${path}`,
      visits: (index + 1) * 120 + this.project().length * 7,
    })),
  );
}
