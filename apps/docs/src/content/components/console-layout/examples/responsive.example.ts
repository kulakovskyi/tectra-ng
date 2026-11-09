import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  TxConsoleLayout,
  TxConsolePanel,
  TxConsoleRailItem,
} from '@tectra-ng/blocks/console-layout';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

const WIDTHS: Record<string, string> = { phone: '375px', tablet: '820px', desktop: '1180px' };
const SECTIONS = [
  { label: 'Projects', icon: 'folder' },
  { label: 'Reports', icon: 'chart-bar' },
  { label: 'Settings', icon: 'cog' },
];
const PROJECTS = ['Website', 'Shop', 'Blog'];

@Component({
  selector: 'console-layout-responsive-example',
  imports: [
    TxConsoleLayout,
    TxConsolePanel,
    TxEmptyState,
    TxPageHeader,
    TxButton,
    TxPanelMenu,
    TxTabs,
    TxTooltip,
  ],
  template: `
    <div class="column">
      <tx-tabs variant="pills" ariaLabel="Device" [tabs]="devices" [(value)]="device" />
      <div class="stage">
        <div class="screen" [style.width]="width()">
          <tx-console-layout
            responsive="container"
            title="Search"
            titleMuted="console"
            logo="/favicon.svg"
            footerName="Search console"
            [crumbs]="crumbs()"
            [railItems]="railItems()"
            [dt]="{ root: { minHeight: '100%', viewportHeight: '558px' } }"
          >
            <button
              txButton
              txConsoleActions
              text
              severity="secondary"
              icon="bell"
              aria-label="Notifications"
              txTooltip="Notifications"
            ></button>
            @if (section() === 'Projects') {
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
                <tx-page-header [title]="project()" subtitle="Pages found this week" />
              </tx-console-panel>
            } @else {
              <tx-page-header class="header" [title]="section()" />
              <tx-empty-state
                variant="framed"
                [icon]="section() === 'Reports' ? 'chart-bar' : 'cog'"
                [title]="'Nothing in ' + section().toLowerCase() + ' yet'"
                text="Open Projects to see the panel fold on narrow screens."
              />
            }
          </tx-console-layout>
        </div>
      </div>
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
    }

    .stage {
      width: 100%;
      overflow-x: auto;
    }

    .screen {
      height: 560px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      transition: width 0.3s ease;
    }

    .header {
      margin-bottom: 20px;
    }

    @media (prefers-reduced-motion: reduce) {
      .screen {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConsoleLayoutResponsiveExample {
  readonly devices: TxTabItem[] = [
    { value: 'phone', label: 'Phone', icon: 'mobile' },
    { value: 'tablet', label: 'Tablet', icon: 'tablet' },
    { value: 'desktop', label: 'Desktop', icon: 'desktop' },
  ];
  readonly device = signal<TxTabValue | undefined>('phone');
  readonly width = computed(() => WIDTHS[String(this.device())] ?? WIDTHS['phone']);
  readonly section = signal('Projects');
  readonly project = signal(PROJECTS[0]);
  readonly crumbs = computed(() =>
    this.section() === 'Projects' ? ['Projects', this.project()] : [this.section()],
  );
  readonly railItems = computed<TxConsoleRailItem[]>(() =>
    SECTIONS.map((item) => ({
      ...item,
      active: item.label === this.section(),
      command: () => this.section.set(item.label),
    })),
  );
  readonly menu = computed<TxPanelMenuItem[]>(() => [
    {
      label: 'Projects',
      items: PROJECTS.map((label) => ({
        label,
        icon: 'folder',
        active: label === this.project(),
        command: () => this.project.set(label),
      })),
    },
  ]);
}
