import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPublicHeader } from '@tectra-ng/blocks/public-header';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'public-header-without-preferences-example',
  imports: [TxPublicHeader, TxButton],
  template: `
    <div class="screen">
      <tx-public-header brand="Northwind" [preferences]="false">
        <div txPublicHeaderActions>
          <button txButton severity="secondary" outlined>Contact sales</button>
        </div>
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
export default class PublicHeaderWithoutPreferencesExample {}
