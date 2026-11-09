import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxPublicHeader } from '@tectra-ng/blocks/public-header';

@Component({
  selector: 'public-header-design-tokens-example',
  imports: [RouterLink, TxPublicHeader],
  template: `
    <div class="screen">
      <tx-public-header
        brand="Northwind"
        logo="/favicon.svg"
        [preferences]="false"
        [dt]="{
          root: { height: '68px', background: 'var(--tx-surface-ground)' },
          nav: { linkFontSize: '14px', linkColor: 'var(--tx-text-primary)' },
        }"
      >
        <nav txPublicHeaderNav aria-label="Main">
          <a routerLink="." [queryParams]="{ section: 'blog' }">Blog</a>
          <a routerLink="." [queryParams]="{ section: 'about' }">About</a>
        </nav>
      </tx-public-header>
    </div>
  `,
  styles: `
    .screen {
      width: 100%;
      border: 1px solid var(--tx-surface-border);
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PublicHeaderDesignTokensExample {}
