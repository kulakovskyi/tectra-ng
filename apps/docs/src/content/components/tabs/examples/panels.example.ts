import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTab, TxTabList, TxTabPanel, TxTabPanels, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-panels-example',
  imports: [TxTabs, TxTabList, TxTab, TxTabPanels, TxTabPanel],
  template: `
    <tx-tabs variant="line" [(value)]="active">
      <tx-tab-list ariaLabel="Project">
        <tx-tab value="summary">Summary</tx-tab>
        <tx-tab value="members" [badge]="4">Members</tx-tab>
        <tx-tab value="activity">Activity</tx-tab>
      </tx-tab-list>
      <tx-tab-panels>
        <tx-tab-panel value="summary">
          <p class="text">Three open tasks, one due this week.</p>
        </tx-tab-panel>
        <tx-tab-panel value="members">
          <p class="text">Four people can open this project.</p>
        </tx-tab-panel>
        <tx-tab-panel value="activity">
          <p class="text">The last change was made two hours ago.</p>
        </tx-tab-panel>
      </tx-tab-panels>
    </tx-tabs>
  `,
  styles: `
    .text {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsPanelsExample {
  readonly active = signal<TxTabValue | undefined>('summary');
}
