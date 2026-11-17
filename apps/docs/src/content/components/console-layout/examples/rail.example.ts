import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  TxConsoleRail,
  TxConsoleRailItem,
  TxConsoleRailResponsive,
} from '@tectra-ng/blocks/console-layout';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

const SECTIONS = [
  { label: 'Inbox', icon: 'inbox' },
  { label: 'Reports', icon: 'chart-bar' },
  { label: 'Settings', icon: 'cog' },
];

@Component({
  selector: 'console-layout-rail-example',
  imports: [TxConsoleRail, TxEmptyState, TxTabs],
  template: `
    <div class="column">
      <tx-tabs variant="pills" ariaLabel="Responsive" [tabs]="modes" [(value)]="mode" />
      <div class="frame" [class.frame--row]="mode() === 'container'">
        <tx-console-rail [responsive]="responsive()" label="Sections" [items]="items()" />
        <tx-empty-state
          class="page"
          [icon]="current().icon"
          [title]="current().label"
          [text]="
            mode() === 'container'
              ? 'This frame is narrower than 768px, so the rail is a row.'
              : 'The rail stays a column at any width.'
          "
        />
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

    .frame {
      container: tx-console-layout / inline-size;
      display: flex;
      width: 100%;
      height: 320px;
      overflow: hidden;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
    }

    .frame--row {
      flex-direction: column;
    }

    .frame--row tx-console-rail {
      height: auto;
    }

    .page {
      flex: 1;
      align-self: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConsoleLayoutRailExample {
  readonly modes: TxTabItem[] = [
    { value: 'container', label: 'container', icon: 'mobile' },
    { value: 'none', label: 'none', icon: 'desktop' },
  ];
  readonly mode = signal<TxTabValue | undefined>('container');
  readonly responsive = computed<TxConsoleRailResponsive>(() =>
    this.mode() === 'none' ? 'none' : 'container',
  );
  readonly section = signal(SECTIONS[0].label);
  readonly current = computed(
    () => SECTIONS.find((item) => item.label === this.section()) ?? SECTIONS[0],
  );
  readonly items = computed<TxConsoleRailItem[]>(() =>
    SECTIONS.map((item) => ({
      ...item,
      active: item.label === this.section(),
      command: () => this.section.set(item.label),
    })),
  );
}
