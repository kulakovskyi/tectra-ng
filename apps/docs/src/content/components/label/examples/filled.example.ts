import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';

@Component({
  selector: 'label-filled-example',
  imports: [TxLabel, TxInput, FormsModule],
  template: `
    <div class="fields">
      <div>
        <tx-label for="label-filled-name" [filled]="!!name()">Full name</tx-label>
        <input txInput id="label-filled-name" [(ngModel)]="name" [fluid]="true" />
      </div>
      <div>
        <tx-label for="label-filled-city" [filled]="!!city()">City</tx-label>
        <input txInput id="label-filled-city" [(ngModel)]="city" [fluid]="true" />
      </div>
    </div>
  `,
  styles: `
    .fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LabelFilledExample {
  readonly name = signal('Olena Kovalenko');
  readonly city = signal('');
}
