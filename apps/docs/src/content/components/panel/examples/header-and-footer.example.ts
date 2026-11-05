import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPanel } from '@tectra/ui/panel';
import { TxButton } from '@tectra/ui/button';
import { TxPill } from '@tectra/ui/pill';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'panel-header-and-footer-example',
  imports: [TxPanel, TxButton, TxPill, TxInput],
  template: `
    <tx-panel title="Domain" icon="globe">
      <div txPanelHeader class="pills">
        <tx-pill tone="success" size="small" icon="check">Verified</tx-pill>
        <tx-pill size="small">HTTPS</tx-pill>
      </div>
      <label class="field">
        <span>Address</span>
        <input txInput [value]="domain()" (input)="domain.set($any($event.target).value)" />
      </label>
      <div txPanelFooter class="actions">
        <button
          txButton
          severity="secondary"
          variant="text"
          (click)="domain.set('docs.example.com')"
        >
          Reset
        </button>
        <button txButton (click)="saved.set(domain())">Save</button>
      </div>
    </tx-panel>
    <p class="status" aria-live="polite">{{ saved() ? 'Saved ' + saved() : '' }}</p>
  `,
  styles: `
    .pills {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 14px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .status {
      min-height: 20px;
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelHeaderAndFooterExample {
  readonly domain = signal('docs.example.com');
  readonly saved = signal('');
}
