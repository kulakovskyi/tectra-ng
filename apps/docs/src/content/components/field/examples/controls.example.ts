import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChipsInput } from '@tectra-ng/ui/chips-input';
import { TxCountrySelect } from '@tectra-ng/ui/country-select';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxField } from '@tectra-ng/ui/field';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputGroup, TxInputGroupAddon } from '@tectra-ng/ui/input-group';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxPassword } from '@tectra-ng/ui/password';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTextarea } from '@tectra-ng/ui/textarea';

@Component({
  selector: 'field-controls-example',
  imports: [
    TxField,
    TxInput,
    TxSelect,
    TxIconField,
    TxInputIcon,
    TxInputGroup,
    TxInputGroupAddon,
    TxTextarea,
    TxDatePicker,
    TxInputNumber,
    TxMultiselect,
    TxChipsInput,
    TxCountrySelect,
    TxPassword,
  ],
  template: `
    <div class="form">
      <tx-field label="Search">
        <tx-icon-field [fluid]="true">
          <tx-input-icon icon="search" />
          <input txInput placeholder="Pages, people, files" />
        </tx-icon-field>
      </tx-field>
      <tx-field label="Website">
        <tx-input-group [fluid]="true">
          <tx-input-group-addon>https://</tx-input-group-addon>
          <input txInput placeholder="example.com" />
        </tx-input-group>
      </tx-field>
      <tx-field label="Role">
        <tx-select [options]="roles" placeholder="Choose a role" />
      </tx-field>
      <tx-field label="Skills">
        <tx-multiselect [options]="skills" placeholder="Pick skills" />
      </tx-field>
      <tx-field label="Country">
        <tx-country-select placeholder="Choose a country" />
      </tx-field>
      <tx-field label="Start date">
        <tx-datepicker placeholder="Pick a date" [showIcon]="true" [fluid]="true" />
      </tx-field>
      <tx-field label="Hours per week">
        <tx-input-number
          placeholder="1–60"
          [showButtons]="true"
          [min]="1"
          [max]="60"
          [fluid]="true"
        />
      </tx-field>
      <tx-field label="Tags" hint="Press Enter after each tag.">
        <tx-chips-input placeholder="Add a tag" />
      </tx-field>
      <tx-field label="Password">
        <tx-password [toggleMask]="true" [fluid]="true" autocomplete="new-password" />
      </tx-field>
      <tx-field label="About" hint="A few words for your profile.">
        <textarea txTextarea rows="3" [fluid]="true"></textarea>
      </tx-field>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      gap: 16px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldControlsExample {
  readonly roles = [
    { label: 'Owner', value: 'owner' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ];
  readonly skills = ['Design', 'Research', 'Frontend', 'Backend', 'Writing'].map((skill) => ({
    label: skill,
    value: skill,
  }));
}
