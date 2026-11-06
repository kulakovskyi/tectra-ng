import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxDivider } from '@tectra-ng/ui/divider';

@Component({
  selector: 'divider-vertical-example',
  imports: [TxDivider],
  template: `
    <div class="row">
      <span>Draft</span>
      <tx-divider layout="vertical" />
      <span>12 files</span>
      <tx-divider layout="vertical" type="dashed" />
      <span>Edited 2 hours ago</span>
    </div>
    <div class="split">
      <p>Sign in with your email and password.</p>
      <tx-divider layout="vertical">or</tx-divider>
      <p>Use a passkey on this device.</p>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      height: 48px;
      font-size: 14px;
    }
    .split {
      display: flex;
      align-items: center;
      height: 120px;
      font-size: 14px;
    }
    .split p {
      flex: 1;
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DividerVerticalExample {}
