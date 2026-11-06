import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect, TxSelectGroupTemplate } from '@tectra-ng/ui/select';

@Component({
  selector: 'select-groups-example',
  imports: [TxSelect, TxSelectGroupTemplate],
  template: `
    <tx-select
      [options]="zones"
      [group]="true"
      [filter]="true"
      [optionLabel]="'name'"
      [optionValue]="'id'"
      [optionGroupLabel]="'region'"
      [optionGroupChildren]="'zones'"
      [placeholder]="'Time zone'"
    >
      <ng-template txSelectGroup let-group
        >{{ group.region }} · {{ group.zones.length }}</ng-template
      >
    </tx-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectGroupsExample {
  readonly zones = [
    {
      region: 'Europe',
      zones: [
        { name: 'Kyiv (UTC+2)', id: 'Europe/Kyiv' },
        { name: 'Warsaw (UTC+1)', id: 'Europe/Warsaw' },
        { name: 'Lisbon (UTC+0)', id: 'Europe/Lisbon' },
      ],
    },
    {
      region: 'America',
      zones: [
        { name: 'New York (UTC−5)', id: 'America/New_York' },
        { name: 'Denver (UTC−7)', id: 'America/Denver' },
      ],
    },
    {
      region: 'Asia',
      zones: [
        { name: 'Tokyo (UTC+9)', id: 'Asia/Tokyo' },
        { name: 'Singapore (UTC+8)', id: 'Asia/Singapore' },
      ],
    },
  ];
}
