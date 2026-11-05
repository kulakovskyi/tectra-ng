import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRadioButton, TxRadioGroup } from '@tectra/ui/radio-button';

@Component({
  selector: 'radio-button-description-example',
  imports: [FormsModule, TxRadioGroup, TxRadioButton],
  template: `
    <tx-radio-group ariaLabel="Visibility" [(ngModel)]="visibility">
      <tx-radio-button value="public" label="Public" description="Anyone with the link can view." />
      <tx-radio-button value="team" label="Team" description="Only members of your workspace." />
      <tx-radio-button
        value="private"
        label="Private"
        description="Only you and people you invite."
      />
    </tx-radio-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonDescriptionExample {
  visibility = 'team';
}
