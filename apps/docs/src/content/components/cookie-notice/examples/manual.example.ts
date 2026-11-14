import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCookieNotice } from '@tectra-ng/blocks/cookie-notice';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'cookie-notice-manual-example',
  imports: [TxCookieNotice, TxButton],
  template: `
    <div class="screen">
      <button txButton severity="secondary" outlined icon="shield" (click)="notice.show()">
        Cookie settings
      </button>
      <tx-cookie-notice #notice cookieName="docs-cookie-manual" [autoShow]="false" />
    </div>
  `,
  styles: `
    .screen {
      width: 100%;
      height: 280px;
      padding: 18px;
      box-sizing: border-box;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      background: var(--tx-surface-ground);
      contain: layout;
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CookieNoticeManualExample {}
