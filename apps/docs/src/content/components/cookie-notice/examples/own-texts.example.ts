import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCookieNotice } from '@tectra-ng/blocks/cookie-notice';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'cookie-notice-own-texts-example',
  imports: [TxCookieNotice, TxButton],
  template: `
    <div class="screen">
      <button txButton severity="secondary" outlined icon="refresh" (click)="notice.show()">
        Show the notice again
      </button>
      <tx-cookie-notice
        #notice
        cookieName="docs-cookie-own"
        icon="lock"
        title="Your session stays private"
        text="We keep one cookie so you stay signed in on this device. Nothing else is stored."
        acceptLabel="Fine"
        linkLabel="How we store data"
        href="https://example.com/privacy"
      />
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
export default class CookieNoticeOwnTextsExample {}
