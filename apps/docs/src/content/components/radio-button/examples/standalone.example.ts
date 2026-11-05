import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRadioButton } from '@tectra/ui/radio-button';

@Component({
  selector: 'radio-button-standalone-example',
  imports: [FormsModule, TxRadioButton],
  template: `
    <div class="row" role="radiogroup" aria-label="Theme">
      <tx-radio-button name="theme" value="light" label="Light" [(ngModel)]="theme" />
      <tx-radio-button name="theme" value="dark" label="Dark" [(ngModel)]="theme" />
      <tx-radio-button name="theme" value="system" label="System" [(ngModel)]="theme" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonStandaloneExample {
  theme = 'system';
}
