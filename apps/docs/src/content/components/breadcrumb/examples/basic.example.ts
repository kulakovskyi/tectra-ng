import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBreadcrumb, TxBreadcrumbItem } from '@tectra-ng/ui/breadcrumb';

@Component({
  selector: 'breadcrumb-basic-example',
  imports: [TxBreadcrumb],
  template: `<tx-breadcrumb [home]="home" [model]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbBasicExample {
  readonly home: TxBreadcrumbItem = { icon: 'home', routerLink: '/', ariaLabel: 'Home' };
  readonly items: TxBreadcrumbItem[] = [
    { label: 'Getting started', routerLink: '/getting-started' },
    { label: 'Theming', routerLink: '/theming' },
    { label: 'Components' },
    { label: 'Breadcrumb' },
  ];
}
