import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxGoBack } from '@tectra-ng/utils/go-back';

@Component({
  selector: 'go-back-basic-example',
  imports: [TxButton, TxGoBack],
  template: `
    <div class="flex">
      <button
        txButton
        icon="arrow-left"
        label="Back"
        severity="secondary"
        txGoBack="/docs"
        #back="txGoBack"
      ></button>
      <span class="hint">{{
        back.canGoBack() ? 'Goes back in history.' : 'Opened directly — goes to /docs.'
      }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GoBackBasicExample {}
