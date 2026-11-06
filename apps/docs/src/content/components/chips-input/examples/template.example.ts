import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxChipsInput, TxChipsInputItemTemplate } from '@tectra-ng/ui/chips-input';

@Component({
  selector: 'chips-input-template-example',
  imports: [TxChipsInput, TxChipsInputItemTemplate, ReactiveFormsModule],
  template: `
    <tx-chips-input [formControl]="tags" [placeholder]="'Hashtags'">
      <ng-template txChipsInputItem let-tag>#{{ tag }}</ng-template>
    </tx-chips-input>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputTemplateExample {
  readonly tags = new FormControl<string[]>(['release', 'changelog']);
}
