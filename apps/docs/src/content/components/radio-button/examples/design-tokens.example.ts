import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRadioButton, TxRadioGroup } from '@tectra-ng/ui/radio-button';

@Component({
  selector: 'radio-button-design-tokens-example',
  imports: [FormsModule, TxRadioGroup, TxRadioButton],
  template: `
    <tx-radio-group
      orientation="horizontal"
      ariaLabel="Ring style"
      [dt]="tokens"
      [(ngModel)]="value"
    >
      <tx-radio-button value="a" label="Ring" />
      <tx-radio-button value="b" label="Ring" />
    </tx-radio-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonDesignTokensExample {
  readonly tokens = {
    root: {
      checkedBackground: 'transparent',
      borderWidth: '2px',
      dotColor: '#0f766e',
      checkedBorderColor: '#0f766e',
      checkedHoverBackground: 'transparent',
    },
  };
  value = 'a';
}
