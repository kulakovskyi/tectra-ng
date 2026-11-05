import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTreeNode, TxTreeSelect } from '@tectra/ui/tree-select';

@Component({
  selector: 'tree-select-design-tokens-example',
  imports: [TxTreeSelect],
  template: `<tx-tree-select
    [options]="teams"
    [placeholder]="'Team'"
    [dt]="{ overlay: { borderRadius: '16px' }, option: { borderRadius: '999px' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeSelectDesignTokensExample {
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
}
