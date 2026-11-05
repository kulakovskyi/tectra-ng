import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxSelect, TxSelectEmptyFilterTemplate, TxSelectFooterTemplate } from '@tectra/ui/select';

@Component({
  selector: 'select-create-option-example',
  imports: [
    TxSelect,
    TxSelectEmptyFilterTemplate,
    TxSelectFooterTemplate,
    TxButton,
    ReactiveFormsModule,
  ],
  template: `
    <tx-select
      [options]="labels()"
      [formControl]="label"
      [filter]="true"
      [resetFilterOnHide]="true"
      [placeholder]="'Label'"
    >
      <ng-template txSelectEmptyFilter let-query>
        <button
          txButton
          [variant]="'text'"
          [size]="'small'"
          [icon]="'plus'"
          (click)="create(query)"
        >
          Create “{{ query }}”
        </button>
      </ng-template>
      <ng-template txSelectFooter>
        <span class="hint">{{ labels().length }} labels</span>
      </ng-template>
    </tx-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectCreateOptionExample {
  readonly labels = signal(['Bug', 'Feature', 'Question']);
  readonly label = new FormControl<string | null>(null);

  create(name: string): void {
    this.labels.update((labels) => [...labels, name]);
    this.label.setValue(name);
  }
}
