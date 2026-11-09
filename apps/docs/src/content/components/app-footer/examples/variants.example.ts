import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAppFooter, TxAppFooterLink, TxAppFooterVariant } from '@tectra-ng/blocks/app-footer';

const page = '/components/app-footer';

@Component({
  selector: 'app-footer-variants-example',
  imports: [TxAppFooter],
  template: `
    <div class="column">
      @for (variant of variants; track variant) {
        <div class="frame">
          <span class="name">{{ variant }}</span>
          <tx-app-footer name="Acme" [variant]="variant" [links]="links" />
        </div>
      }
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .frame {
      padding-top: 12px;
      border-radius: 12px;
      background: var(--tx-surface-ground);
      overflow: hidden;
    }

    .name {
      display: block;
      padding: 0 16px 8px;
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppFooterVariantsExample {
  readonly variants: TxAppFooterVariant[] = ['page', 'app', 'console'];
  readonly links: TxAppFooterLink[] = [
    { label: 'Privacy policy', routerLink: page, queryParams: { legal: 'privacy' } },
    { label: 'Terms of use', routerLink: page, queryParams: { legal: 'terms' } },
  ];
}
