import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRadioButton, TxRadioGroup } from '@tectra-ng/ui/radio-button';

@Component({
  selector: 'radio-button-states-example',
  imports: [FormsModule, TxRadioGroup, TxRadioButton],
  template: `
    <div class="list">
      <tx-radio-group orientation="horizontal" ariaLabel="One disabled" [ngModel]="'a'">
        <tx-radio-button value="a" label="Available" />
        <tx-radio-button value="b" label="Sold out" [disabled]="true" />
      </tx-radio-group>
      <tx-radio-group
        orientation="horizontal"
        ariaLabel="Disabled group"
        [disabled]="true"
        [ngModel]="'a'"
      >
        <tx-radio-button value="a" label="Disabled, checked" />
        <tx-radio-button value="b" label="Disabled" />
      </tx-radio-group>
      <tx-radio-group orientation="horizontal" ariaLabel="Invalid" [invalid]="true">
        <tx-radio-button value="a" label="Invalid" />
        <tx-radio-button value="b" label="Invalid" />
      </tx-radio-group>
      <div class="row">
        <tx-radio-button value="a" label="Read only" [readonly]="true" [ngModel]="'a'" />
      </div>
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonStatesExample {}
