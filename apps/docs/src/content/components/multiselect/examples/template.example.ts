import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar, TxAvatarGroup } from '@tectra-ng/ui/avatar';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxSelectOptionTemplate, TxSelectValueTemplate } from '@tectra-ng/ui/select';

@Component({
  selector: 'multiselect-template-example',
  imports: [TxMultiselect, TxSelectOptionTemplate, TxSelectValueTemplate, TxAvatar, TxAvatarGroup],
  template: `
    <tx-multiselect
      [options]="people"
      [optionLabel]="'name'"
      [optionValue]="'id'"
      [placeholder]="'Reviewers'"
    >
      <ng-template txSelectOption let-person>
        <span class="person">
          <tx-avatar [name]="person.name" [size]="'small'" />
          {{ person.name }}
        </span>
      </ng-template>
      <ng-template txSelectValue let-items>
        <tx-avatar-group [size]="'small'" [max]="4" [ariaLabel]="'Reviewers'">
          @for (item of items; track item.value) {
            <tx-avatar [name]="item.label" />
          }
        </tx-avatar-group>
      </ng-template>
    </tx-multiselect>
  `,
  styles: `
    .person {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectTemplateExample {
  readonly people = [
    { id: 1, name: 'Olena Kovalenko' },
    { id: 2, name: 'Taras Shevchuk' },
    { id: 3, name: 'Iryna Bondar' },
    { id: 4, name: 'Mykola Hrytsenko' },
    { id: 5, name: 'Sofia Melnyk' },
  ];
}
