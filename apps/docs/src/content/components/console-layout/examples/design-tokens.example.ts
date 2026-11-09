import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxConsoleLayout, TxConsoleRailItem } from '@tectra-ng/blocks/console-layout';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';

@Component({
  selector: 'console-layout-design-tokens-example',
  imports: [TxConsoleLayout, TxPageHeader],
  template: `
    <div class="screen">
      <tx-console-layout
        title="Mail"
        logo="/favicon.svg"
        [crumbs]="[section()]"
        [railItems]="railItems()"
        [dt]="{
          root: { minHeight: '100%', viewportHeight: '398px' },
          header: { height: '64px' },
          rail: { width: '72px' },
          railItem: {
            activeBackground: 'var(--tx-surface-hover)',
            activeHoverBackground: 'var(--tx-surface-hover)',
          },
        }"
      >
        <tx-page-header [title]="section()" subtitle="Nothing new since this morning" />
      </tx-console-layout>
    </div>
  `,
  styles: `
    .screen {
      width: 100%;
      height: 400px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConsoleLayoutDesignTokensExample {
  readonly section = signal('Inbox');
  readonly railItems = computed<TxConsoleRailItem[]>(() =>
    [
      { label: 'Inbox', icon: 'inbox' },
      { label: 'Sent', icon: 'send' },
      { label: 'Archive', icon: 'box' },
    ].map((item) => ({
      ...item,
      active: item.label === this.section(),
      command: () => this.section.set(item.label),
    })),
  );
}
