import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxPanel } from '@tectra-ng/ui/panel';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'panel-header-and-footer-example',
  imports: [TxPanel, TxButton, TxPill, TxField, TxInput],
  template: `
    <tx-panel title="Domain" icon="globe">
      <div txPanelHeader class="pills">
        <tx-pill tone="success" size="small" icon="check">Verified</tx-pill>
        <tx-pill size="small">HTTPS</tx-pill>
      </div>
      <tx-field label="Address">
        <input
          txInput
          [fluid]="true"
          [value]="domain()"
          (input)="domain.set($any($event.target).value)"
        />
      </tx-field>
      <div txPanelFooter class="actions">
        <button
          txButton
          severity="secondary"
          variant="text"
          (click)="domain.set('docs.example.com')"
        >
          Reset
        </button>
        <button txButton (click)="save()">Save</button>
      </div>
    </tx-panel>
  `,
  styles: `
    .pills {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelHeaderAndFooterExample {
  private readonly toast = inject(TxToastService);
  readonly domain = signal('docs.example.com');

  save(): void {
    this.toast.success(`Saved ${this.domain()}`);
  }
}
