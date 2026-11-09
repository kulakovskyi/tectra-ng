import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'page-header-tabs-example',
  imports: [TxPageHeader, TxTabs],
  template: `
    <div class="ground">
      <tx-page-header title="Tasks" subtitle="Everything assigned to your team">
        <tx-tabs variant="pills" raised ariaLabel="Task view" [tabs]="views" [(value)]="view" />
      </tx-page-header>
    </div>
    <p class="note">View: {{ view() }}</p>
  `,
  styles: `
    .ground {
      padding: 20px;
      border-radius: 12px;
      background: var(--tx-surface-ground);
    }

    .note {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageHeaderTabsExample {
  readonly views: TxTabItem[] = [
    { value: 'list', label: 'List', icon: 'list' },
    { value: 'board', label: 'Board', icon: 'objects-column' },
    { value: 'calendar', label: 'Calendar', icon: 'calendar' },
  ];
  readonly view = signal<TxTabValue | undefined>('list');
}
