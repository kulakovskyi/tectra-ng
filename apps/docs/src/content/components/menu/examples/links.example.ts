import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenu, TxMenuItem } from '@tectra-ng/ui/menu';

@Component({
  selector: 'menu-links-example',
  imports: [TxMenu],
  template: `<tx-menu ariaLabel="Documentation" [model]="links" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuLinksExample {
  readonly links: TxMenuItem[] = [
    { label: 'Getting started', icon: 'home', routerLink: '/getting-started' },
    { label: 'Theming', icon: 'cog', routerLink: '/theming' },
    { label: 'Icons', icon: 'star', routerLink: '/icons' },
    { separator: true },
    { label: 'Angular docs', icon: 'external-link', url: 'https://angular.dev', target: '_blank' },
  ];
}
