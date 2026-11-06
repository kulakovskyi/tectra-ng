import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBreadcrumb, TxBreadcrumbItem } from '@tectra-ng/ui/breadcrumb';

@Component({
  selector: 'breadcrumb-design-tokens-example',
  imports: [TxBreadcrumb],
  template: `
    <tx-breadcrumb
      [home]="home"
      [model]="items"
      [dt]="{
        root: { padding: '12px 14px', background: 'var(--tx-surface-ground)' },
        item: { color: 'var(--tx-primary-base)', hoverColor: 'var(--tx-primary-hover)' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbDesignTokensExample {
  readonly home: TxBreadcrumbItem = { icon: 'home', routerLink: '/', ariaLabel: 'Home' };
  readonly items: TxBreadcrumbItem[] = [
    { label: 'Icons', routerLink: '/icons' },
    { label: 'Brand logos' },
  ];
}
