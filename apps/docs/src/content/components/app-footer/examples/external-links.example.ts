import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAppFooter, TxAppFooterLink } from '@tectra-ng/blocks/app-footer';

@Component({
  selector: 'app-footer-external-links-example',
  imports: [TxAppFooter],
  template: `
    <tx-app-footer
      class="footer"
      name="Acme Labs"
      navLabel="Company"
      [year]="2026"
      [links]="links"
    />
  `,
  styles: `
    .footer {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppFooterExternalLinksExample {
  readonly links: TxAppFooterLink[] = [
    { label: 'Status', url: 'https://example.com/status', target: '_blank' },
    { label: 'Security', url: 'https://example.com/security', target: '_blank' },
  ];
}
