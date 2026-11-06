import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxMenubar } from '@tectra-ng/ui/menubar';

@Component({
  selector: 'menubar-start-and-end-example',
  imports: [TxMenubar, TxAvatar, TxIconField, TxInputIcon, TxInput],
  template: `
    <tx-menubar ariaLabel="Workspace" [model]="items">
      <span txMenubarStart class="brand">Atlas</span>
      <div txMenubarEnd class="end">
        <tx-icon-field>
          <tx-input-icon icon="search" />
          <input txInput size="small" placeholder="Search" aria-label="Search" />
        </tx-icon-field>
        <tx-avatar label="OK" shape="circle" size="small" />
      </div>
    </tx-menubar>
  `,
  styles: `
    .brand {
      padding: 0 8px;
      font-weight: 700;
    }
    .end {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenubarStartAndEndExample {
  readonly items: TxMenuItem[] = [
    { label: 'Projects', icon: 'folder' },
    { label: 'Reports', icon: 'chart-bar', items: [{ label: 'Traffic' }, { label: 'Revenue' }] },
    { label: 'Team', icon: 'users' },
  ];
}
