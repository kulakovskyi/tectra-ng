import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxToastService } from '@tectra-ng/ui/toast';
import { TxToggleSwitch, TxToggleSwitchChangeEvent } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-settings-example',
  imports: [TxToggleSwitch],
  template: `
    <div class="list">
      @for (setting of settings; track setting.id) {
        <div class="item">
          <tx-toggle-switch
            [label]="setting.label"
            [description]="setting.description"
            labelPosition="start"
            (changed)="saved($event, setting.label)"
          />
        </div>
      }
    </div>
  `,
  styles: `
    .list {
      display: grid;
      max-width: 420px;
    }

    .item {
      padding: 12px 0;
      border-bottom: 1px solid var(--tx-surface-border);
    }

    .item tx-toggle-switch {
      display: flex;
      justify-content: space-between;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchSettingsExample {
  readonly settings = [
    { id: 'digest', label: 'Weekly digest', description: 'A summary every Monday' },
    { id: 'mentions', label: 'Mentions', description: 'When someone tags you' },
    { id: 'billing', label: 'Billing', description: 'Invoices and payment issues' },
  ];
  private readonly toast = inject(TxToastService);

  saved(event: TxToggleSwitchChangeEvent, label: string): void {
    this.toast.success(`${label} ${event.checked ? 'on' : 'off'}`);
  }
}
