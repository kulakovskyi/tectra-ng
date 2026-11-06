import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'tooltip-disabled-example',
  imports: [TxTooltip, TxButton, TxToggleSwitch, FormsModule],
  template: `
    <div class="column">
      <tx-toggle-switch label="Show hints" [(ngModel)]="hints" />
      <div class="row">
        <button
          txButton
          icon="refresh"
          severity="secondary"
          [text]="true"
          aria-label="Refresh"
          txTooltip="Reload the list"
          [tooltipDisabled]="!hints()"
        ></button>
        <span tabindex="0" class="reason" txTooltip="Fill in the required fields first">
          <button txButton [disabled]="true">Publish</button>
        </span>
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
      gap: 12px;
    }
    .reason {
      display: inline-flex;
      border-radius: var(--tx-radius-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipDisabledExample {
  readonly hints = signal(true);
}
