import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxTreeNode, TxTreeSelect } from '@tectra-ng/ui/tree-select';

@Component({
  selector: 'tree-select-multiple-example',
  imports: [TxTreeSelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-tree-select
        [options]="teams"
        [formControl]="team"
        [selectionMode]="'multiple'"
        [display]="'chip'"
        [placeholder]="'Teams'"
      />
      <span class="hint">Value: {{ team.value ?? '—' }}</span>
    </div>
  `,
  styles: `
    tx-tree-select {
      width: 20rem;
      max-width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeSelectMultipleExample {
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
  readonly team = new FormControl<string[]>(['web-ui', 'api', 'sales', 'support']);
}
