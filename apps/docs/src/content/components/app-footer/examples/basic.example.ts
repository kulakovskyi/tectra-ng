import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAppFooter, TxAppFooterLink } from '@tectra-ng/blocks/app-footer';

const page = '/components/app-footer';

@Component({
  selector: 'app-footer-basic-example',
  imports: [TxAppFooter],
  template: `<tx-app-footer class="footer" name="Acme" [links]="links" />`,
  styles: `
    .footer {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppFooterBasicExample {
  readonly links: TxAppFooterLink[] = [
    { label: 'Privacy policy', routerLink: page, queryParams: { legal: 'privacy' } },
    { label: 'Terms of use', routerLink: page, queryParams: { legal: 'terms' } },
    { label: 'Cookie policy', routerLink: page, queryParams: { legal: 'cookies' } },
  ];
}
