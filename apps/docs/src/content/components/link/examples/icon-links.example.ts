import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxIconLink } from '@tectra-ng/ui/link';

@Component({
  selector: 'link-icon-links-example',
  imports: [TxIconLink],
  template: `
    <nav class="nav" aria-label="Account">
      <tx-icon-link icon="th-large" text="Link" routerLink="/components/link" />
      <tx-icon-link icon="user" text="Avatar" routerLink="/components/avatar" />
      <tx-icon-link icon="book" text="Guide" href="https://example.com/guide" />
      <tx-icon-link icon="sign-out" text="Log out" (click)="count.set(count() + 1)" />
    </nav>
    <p class="status" aria-live="polite">{{ count() ? 'Log out clicked ' + count() + '×' : '' }}</p>
  `,
  styles: `
    .nav {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .status {
      min-height: 20px;
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkIconLinksExample {
  readonly count = signal(0);
}
