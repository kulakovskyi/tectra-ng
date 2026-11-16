import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-ng-model-example',
  imports: [FormsModule, TxField, TxSelectButton, TxButton],
  template: `
    <form class="form" #form="ngForm" (ngSubmit)="saved = form.valid ?? false">
      <tx-field label="Notify me about">
        <tx-select-button
          name="topics"
          [multiple]="true"
          [options]="topics"
          [(ngModel)]="picked"
          required
        />
      </tx-field>
      <button txButton type="submit">Save</button>
      <span class="hint"
        >Picked: {{ picked.length ? picked.join(', ') : 'nothing'
        }}{{ saved ? ' · saved' : '' }}</span
      >
    </form>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonNgModelExample {
  readonly topics = ['Comments', 'Mentions', 'Releases', 'Security'];
  picked: string[] = ['Mentions'];
  saved = false;
}
