import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxConfirmService } from '@tectra-ng/ui/confirm';
import { TxToastService } from '@tectra-ng/ui/toast';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'confirm-async-example',
  imports: [TxButton, TxToggleSwitch, FormsModule],
  template: `
    <div class="column">
      <tx-toggle-switch label="Make the request fail" [(ngModel)]="failing" />
      <div class="row">
        <code>sk_live_••••7Q2M</code>
        <button
          txButton
          severity="danger"
          [outlined]="true"
          [disabled]="revoked()"
          (click)="revoke()"
        >
          {{ revoked() ? 'Revoked' : 'Revoke key' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .column {
      display: grid;
      gap: 16px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmAsyncExample {
  private confirm = inject(TxConfirmService);
  private readonly toast = inject(TxToastService);
  readonly revoked = signal(false);
  failing = false;

  async revoke(): Promise<void> {
    const ok = await this.confirm.dialog({
      title: 'Revoke this key?',
      message: 'Apps that use it stop working at once.',
      severity: 'danger',
      acceptLabel: 'Revoke',
      accept: () =>
        new Promise<void>((resolve, reject) =>
          setTimeout(() => (this.failing ? reject(new Error('offline')) : resolve()), 1500),
        ).catch((error: unknown) => {
          this.toast.error('Could not revoke the key — check the connection and try again');
          throw error;
        }),
    });
    this.revoked.set(ok);
    if (ok) this.toast.success('Key revoked');
  }
}
