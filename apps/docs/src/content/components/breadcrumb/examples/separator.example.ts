import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBreadcrumb, TxBreadcrumbItem } from '@tectra-ng/ui/breadcrumb';

@Component({
  selector: 'breadcrumb-separator-example',
  imports: [TxBreadcrumb],
  template: `<tx-breadcrumb separator="slash" [model]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbSeparatorExample {
  readonly items: TxBreadcrumbItem[] = [
    { label: 'Docs', routerLink: '/' },
    { label: 'Core', routerLink: '/core/overlay' },
    { label: 'Locale' },
  ];
}
