import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAppFooter, TxAppFooterLink } from '@tectra-ng/blocks/app-footer';

const page = '/components/app-footer';

@Component({
  selector: 'app-footer-design-tokens-example',
  imports: [TxAppFooter],
  template: `
    <tx-app-footer
      class="footer"
      name="Acme"
      [links]="links"
      [dt]="{
        root: { fontSize: '12px', lineHeight: '20px' },
        link: { color: 'var(--tx-text-primary)', hoverColor: 'var(--tx-primary-base)' },
      }"
    />
  `,
  styles: `
    .footer {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppFooterDesignTokensExample {
  readonly links: TxAppFooterLink[] = [
    { label: 'Privacy policy', routerLink: page, queryParams: { legal: 'privacy' } },
    { label: 'Terms of use', routerLink: page, queryParams: { legal: 'terms' } },
  ];
}
