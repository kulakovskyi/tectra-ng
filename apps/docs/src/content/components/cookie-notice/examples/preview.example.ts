import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCookieNotice } from '@tectra-ng/blocks/cookie-notice';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'cookie-notice-preview-example',
  imports: [FormsModule, TxCookieNotice, TxToggleSwitch],
  template: `
    <div class="screen">
      <tx-toggle-switch label="Preview the notice" [(ngModel)]="preview" />
      <tx-cookie-notice
        cookieName="docs-cookie-preview"
        [autoShow]="false"
        [preview]="preview()"
        (dismissed)="preview.set(false)"
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
export default class CookieNoticePreviewExample {
  readonly preview = signal(true);
}
