import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxMenubar } from '@tectra-ng/ui/menubar';

@Component({
  selector: 'menubar-router-links-example',
  imports: [TxMenubar],
  template: `<tx-menubar ariaLabel="Site" [model]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenubarRouterLinksExample {
  readonly items: TxMenuItem[] = [
    { label: 'Getting started', icon: 'home', routerLink: '/getting-started' },
    {
      label: 'Components',
      icon: 'th-large',
      items: [
        { label: 'Tabs', routerLink: '/components/tabs' },
        { label: 'Accordion', routerLink: '/components/accordion' },
        { label: 'Breadcrumb', routerLink: '/components/breadcrumb' },
      ],
    },
    { label: 'Theming', icon: 'palette', routerLink: '/theming' },
  ];
}
