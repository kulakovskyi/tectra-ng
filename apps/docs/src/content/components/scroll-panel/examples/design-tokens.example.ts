import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScrollPanel } from '@tectra-ng/ui/scroll-panel';

@Component({
  selector: 'scroll-panel-design-tokens-example',
  imports: [TxScrollPanel],
  template: `
    <tx-scroll-panel
      class="panel"
      ariaLabel="Terms"
      [dt]="{
        bar: {
          size: '6px',
          borderRadius: 'var(--tx-radius-full)',
          background: 'var(--tx-primary-base)',
        },
      }"
    >
      @for (section of sections; track section) {
        <p class="text">{{ section }}</p>
      }
    </tx-scroll-panel>
  `,
  styles: `
    .panel {
      height: 180px;
    }

    .text {
      margin: 0 0 12px;
      padding-right: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScrollPanelDesignTokensExample {
  readonly sections = [
    'The service is provided as is. We keep it available and secure, and we tell you ahead of planned maintenance.',
    'Your data stays yours. You can export it at any time and we delete it within thirty days after you close the account.',
    'Invoices are sent at the start of each billing period. Plans can be changed or cancelled before the next period begins.',
    'Accounts are personal. Invite teammates instead of sharing a sign-in, so every action has a clear owner.',
    'We may update these terms. Changes are announced by email at least two weeks before they take effect.',
  ];
}
