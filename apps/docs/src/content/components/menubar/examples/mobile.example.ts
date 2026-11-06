import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxMenubar } from '@tectra-ng/ui/menubar';

@Component({
  selector: 'menubar-mobile-example',
  imports: [TxMenubar],
  template: `
    <div class="frame">
      <tx-menubar ariaLabel="Account" breakpoint="5000px" [model]="items">
        <span txMenubarStart class="brand">Atlas</span>
      </tx-menubar>
    </div>
  `,
  styles: `
    .frame {
      width: 100%;
      min-height: 300px;
    }
    .brand {
      padding: 0 8px;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenubarMobileExample {
  readonly items: TxMenuItem[] = [
    { label: 'Dashboard', icon: 'home' },
    {
      label: 'Billing',
      icon: 'credit-card',
      items: [
        { label: 'Invoices' },
        { label: 'Payment methods' },
        { label: 'Plans', items: [{ label: 'Team' }, { label: 'Business' }] },
      ],
    },
    { label: 'Settings', icon: 'cog' },
  ];
}
