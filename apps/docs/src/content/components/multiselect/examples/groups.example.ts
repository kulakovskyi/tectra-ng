import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMultiselect } from '@tectra/ui/multiselect';

@Component({
  selector: 'multiselect-groups-example',
  imports: [TxMultiselect],
  template: `<tx-multiselect
    [options]="permissions"
    [group]="true"
    [optionGroupLabel]="'area'"
    [optionGroupChildren]="'rights'"
    [placeholder]="'Permissions'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectGroupsExample {
  readonly permissions = [
    {
      area: 'Projects',
      rights: [
        { label: 'View projects', value: 'projects.view' },
        { label: 'Edit projects', value: 'projects.edit' },
      ],
    },
    {
      area: 'Billing',
      rights: [
        { label: 'View invoices', value: 'billing.view' },
        { label: 'Pay invoices', value: 'billing.pay' },
      ],
    },
  ];
}
