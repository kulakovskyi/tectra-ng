import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { TxLabel } from '@tectra-ng/ui/label';
import { FormsModule } from '@angular/forms';
import {
  TxTab,
  TxTabList,
  TxTabPanel,
  TxTabPanelContent,
  TxTabPanels,
  TxTabValue,
  TxTabs,
} from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-lazy-example',
  imports: [
    TxTabs,
    TxTabList,
    TxTab,
    TxTabPanels,
    TxTabPanel,
    TxTabPanelContent,
    TxToggleSwitch,
    TxLabel,
    FormsModule,
  ],
  template: `
    <div class="option">
      <tx-toggle-switch inputId="tabs-lazy-only-active" [(ngModel)]="lazy" />
      <tx-label for="tabs-lazy-only-active">Render only the active panel</tx-label>
    </div>
    <tx-tabs variant="line" [lazy]="lazy()" [(value)]="active">
      <tx-tab-list ariaLabel="Reports">
        @for (report of reports; track report) {
          <tx-tab [value]="report">{{ report }}</tx-tab>
        }
      </tx-tab-list>
      <tx-tab-panels>
        @for (report of reports; track report) {
          <tx-tab-panel [value]="report">
            <ng-template txTabPanelContent>
              <p class="text">{{ report }} report, rendered at {{ renderedAt() }}.</p>
            </ng-template>
          </tx-tab-panel>
        }
      </tx-tab-panels>
    </tx-tabs>
  `,
  styles: `
    .option {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .text {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsLazyExample {
  readonly reports = ['Daily', 'Weekly', 'Monthly'];
  readonly active = signal<TxTabValue | undefined>('Daily');
  readonly lazy = signal(false);

  renderedAt(): string {
    return new Date().toLocaleTimeString();
  }
}
