import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxIconLink } from '@tectra-ng/ui/link';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'link-icon-links-example',
  imports: [TxIconLink],
  template: `
    <nav class="nav" aria-label="Account">
      <tx-icon-link icon="th-large" text="Link" routerLink="/components/link" />
      <tx-icon-link icon="user" text="Avatar" routerLink="/components/avatar" />
      <tx-icon-link icon="book" text="Guide" href="https://example.com/guide" />
      <tx-icon-link icon="sign-out" text="Log out" (click)="toast.info('Signed out')" />
    </nav>
  `,
  styles: `
    .nav {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkIconLinksExample {
  readonly toast = inject(TxToastService);
}
