import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxSlider } from '@tectra-ng/ui/slider';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'docs-landing-form-demo',
  imports: [FormsModule, TxButton, TxField, TxInput, TxSelect, TxSlider, TxToggleSwitch],
  template: `
    <form class="form" (submit)="$event.preventDefault()">
      <tx-field label="Workspace name">
        <input txInput name="workspace" [(ngModel)]="workspace" />
      </tx-field>
      <tx-field label="Plan">
        <tx-select name="plan" [options]="plans" [(ngModel)]="plan" />
      </tx-field>
      <tx-field [label]="'Seats: ' + seats()">
        <tx-slider name="seats" [min]="1" [max]="50" [(ngModel)]="seats" />
      </tx-field>
      <tx-toggle-switch name="digest" label="Weekly email digest" [(ngModel)]="digest" />
      <button txButton type="submit">Create workspace</button>
    </form>
  `,
  styles: `
    .form {
      display: grid;
      gap: 16px;
    }

    .form button {
      justify-self: start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFormDemo {
  readonly workspace = signal('Acme Console');
  readonly plan = signal('team');
  readonly seats = signal(12);
  readonly digest = signal(true);
  readonly plans = [
    { label: 'Starter', value: 'starter' },
    { label: 'Team', value: 'team' },
    { label: 'Business', value: 'business' },
  ];
}
