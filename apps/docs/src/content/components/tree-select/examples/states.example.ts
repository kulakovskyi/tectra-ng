import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxTreeNode, TxTreeSelect } from '@tectra-ng/ui/tree-select';

@Component({
  selector: 'tree-select-states-example',
  imports: [TxTreeSelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-tree-select [options]="teams" [size]="'small'" [placeholder]="'Small'" />
      <tx-tree-select [options]="teams" [variant]="'filled'" [placeholder]="'Filled'" />
      <tx-tree-select [options]="teams" [formControl]="locked" [ariaLabel]="'Disabled'" />
      <tx-tree-select
        [options]="teams"
        [formControl]="shown"
        [readonly]="true"
        [ariaLabel]="'Read only'"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeSelectStatesExample {
  readonly teams: TxTreeNode[] = [
    {
      key: 'eng',
      label: 'Engineering',
      icon: 'cog',
      children: [
        {
          key: 'web',
          label: 'Web',
          icon: 'globe',
          children: [
            { key: 'web-ui', label: 'UI kit' },
            { key: 'web-app', label: 'App' },
          ],
        },
        { key: 'api', label: 'API', icon: 'server' },
        { key: 'qa', label: 'QA', icon: 'check-circle' },
      ],
    },
    {
      key: 'biz',
      label: 'Business',
      icon: 'briefcase',
      children: [
        { key: 'sales', label: 'Sales', icon: 'chart-line' },
        { key: 'support', label: 'Support', icon: 'comments' },
      ],
    },
    { key: 'board', label: 'Board', icon: 'users', disabled: true },
  ];
  readonly locked = new FormControl({ value: 'qa', disabled: true });
  readonly shown = new FormControl('support');
}
