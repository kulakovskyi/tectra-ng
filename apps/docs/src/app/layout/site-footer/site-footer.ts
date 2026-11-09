import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxAppFooter } from '@tectra-ng/blocks/app-footer';
import { FOOTER_COLUMNS, FOOTER_LINKS } from '../../data/footer.data';
import { DocsLogo } from '../logo/logo';

@Component({
  selector: 'docs-site-footer',
  imports: [RouterLink, TxAppFooter, DocsLogo],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'site-footer',
    role: 'contentinfo',
    '[style.--site-footer-width]': 'width()',
  },
})
export class DocsSiteFooter {
  readonly width = input('1180px');

  readonly columns = FOOTER_COLUMNS;
  readonly links = FOOTER_LINKS;
  readonly barTokens = {
    root: { borderColor: 'var(--site-footer-line, var(--docs-hairline))' },
    page: { maxWidth: 'calc(var(--site-footer-width) + 44px)', padding: '22px' },
  };
}
