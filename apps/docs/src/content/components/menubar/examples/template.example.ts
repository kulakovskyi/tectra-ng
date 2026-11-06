import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxMenubar, TxMenubarItemTemplate } from '@tectra-ng/ui/menubar';
import { TxPill } from '@tectra-ng/ui/pill';

@Component({
  selector: 'menubar-template-example',
  imports: [TxMenubar, TxMenubarItemTemplate, TxIcon, TxPill],
  template: `
    <tx-menubar ariaLabel="Product" [model]="items">
      <ng-template txMenubarItem let-item let-hasSubmenu="hasSubmenu">
        <span class="item">
          {{ item.label }}
          @if (item.data === 'new') {
            <tx-pill tone="primary" size="small">New</tx-pill>
          }
          @if (hasSubmenu) {
            <tx-icon name="angle-down" />
          }
        </span>
      </ng-template>
    </tx-menubar>
  `,
  styles: `
    .item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenubarTemplateExample {
  readonly items: TxMenuItem[] = [
    { label: 'Features', items: [{ label: 'Reports' }, { label: 'Exports', data: 'new' }] },
    { label: 'Pricing' },
    { label: 'Changelog', data: 'new' },
  ];
}
