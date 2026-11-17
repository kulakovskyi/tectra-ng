import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxConsoleRail, TxConsoleRailItem } from '@tectra-ng/blocks/console-layout';
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
      <tx-tabs variant="pills" ariaLabel="Frame width" [tabs]="widths" [(value)]="width" />
      <div class="stage">
        <div class="frame" [style.width]="width() === 'narrow' ? '375px' : '820px'">
          <div class="body">
            <tx-console-rail responsive="container" label="Sections" [items]="items()" />
            <tx-empty-state
              class="page"
              [icon]="current().icon"
              [title]="current().label"
              text="The rail turns into a row when its frame is narrower than 768px."
            />
          </div>
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

    .frame {
      container: tx-console-layout / inline-size;
      height: 320px;
      overflow: hidden;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      transition: width 0.3s ease;
    }

    .body {
      display: flex;
      height: 100%;
    }

    .page {
      flex: 1;
      align-self: center;
    }

    @container tx-console-layout (width < 768px) {
      .body {
        flex-direction: column;
      }

      tx-console-rail {
        height: auto;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .frame {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConsoleLayoutRailExample {
  readonly widths: TxTabItem[] = [
    { value: 'narrow', label: 'Narrow', icon: 'mobile' },
    { value: 'wide', label: 'Wide', icon: 'desktop' },
  ];
  readonly width = signal<TxTabValue | undefined>('narrow');
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
