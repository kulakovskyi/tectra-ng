import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadioButton, TxRadioGroup } from '@tectra-ng/ui/radio-button';

@Component({
  selector: 'radio-button-sizes-example',
  imports: [TxRadioGroup, TxRadioButton],
  template: `
    <div class="list">
      <tx-radio-group size="small" orientation="horizontal" ariaLabel="Small">
        <tx-radio-button value="a" label="Small" />
        <tx-radio-button value="b" label="Small" />
      </tx-radio-group>
      <tx-radio-group orientation="horizontal" ariaLabel="Medium">
        <tx-radio-button value="a" label="Medium" />
        <tx-radio-button value="b" label="Medium" />
      </tx-radio-group>
      <tx-radio-group size="large" orientation="horizontal" ariaLabel="Large">
        <tx-radio-button value="a" label="Large" />
        <tx-radio-button value="b" label="Large" />
      </tx-radio-group>
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonSizesExample {}
