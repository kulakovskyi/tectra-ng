import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListbox } from '@tectra-ng/ui/listbox';

@Component({
  selector: 'listbox-groups-example',
  imports: [TxListbox],
  template: `<tx-listbox
    [options]="fonts"
    [group]="true"
    [optionGroupLabel]="'family'"
    [optionGroupChildren]="'faces'"
    [scrollHeight]="'220px'"
    [ariaLabel]="'Font'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListboxGroupsExample {
  readonly fonts = [
    {
      family: 'Sans',
      faces: [
        { label: 'Regular', value: 'sans-400' },
        { label: 'Medium', value: 'sans-500' },
        { label: 'Bold', value: 'sans-700' },
      ],
    },
    {
      family: 'Serif',
      faces: [
        { label: 'Regular', value: 'serif-400' },
        { label: 'Italic', value: 'serif-400i' },
      ],
    },
    { family: 'Mono', faces: [{ label: 'Regular', value: 'mono-400' }] },
  ];
}
