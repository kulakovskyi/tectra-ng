import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxChip } from '@tectra-ng/ui/chip';
import { TxField } from '@tectra-ng/ui/field';
import { TxFieldError } from '@tectra-ng/ui/message';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxValidators } from '@tectra-ng/utils/validators';

@Component({
  selector: 'validators-lists-example',
  imports: [ReactiveFormsModule, TxButton, TxChip, TxField, TxFieldError, TxInput, TxInputNumber],
  template: `
    <div class="form">
      <div class="flex">
        @for (tag of tags(); track tag) {
          <tx-chip [label]="tag" />
        }
      </div>
      <div class="row">
        <tx-field label="New tag" [control]="tag" showImmediately>
          <input txInput [formControl]="tag" [fluid]="true" />
        </tx-field>
        <button
          txButton
          label="Add"
          [disabled]="tag.invalid || !tag.value"
          (click)="add()"
        ></button>
      </div>
      <div class="shares" [formGroup]="owners">
        @for (row of owners.controls.list.controls; track row; let index = $index) {
          <tx-field [label]="'Owner ' + (index + 1) + ', %'">
            <tx-input-number
              [formControl]="row.controls.share"
              [min]="0"
              [max]="100"
              [fluid]="true"
            />
          </tx-field>
        }
      </div>
      <tx-field-error [control]="owners.controls.list" showImmediately />
    </div>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 420px;
    }
    .row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .row tx-field {
      flex: 1;
    }
    .shares {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ValidatorsListsExample {
  readonly tags = signal(['Design', 'Billing', 'Support']);
  readonly tag = new FormControl('billing', {
    nonNullable: true,
    validators: TxValidators.duplicate(() => this.tags()),
  });
  readonly owners = new FormGroup({
    list: new FormArray(
      [50, 30, 30].map((share) => new FormGroup({ share: new FormControl<number | null>(share) })),
      TxValidators.arraySumMax('share', 100),
    ),
  });

  add(): void {
    this.tags.update((tags) => [...tags, this.tag.value.trim()]);
    this.tag.setValue('');
  }
}
