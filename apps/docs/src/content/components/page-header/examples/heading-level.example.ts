import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'page-header-heading-level-example',
  imports: [TxPageHeader, TxButton],
  template: `
    <div class="ground">
      <tx-page-header title="API keys" subtitle="3 active keys" [headingLevel]="2">
        <button txButton severity="secondary" outlined icon="plus">New key</button>
      </tx-page-header>
    </div>
  `,
  styles: `
    .ground {
      padding: 20px;
      border-radius: 12px;
      background: var(--tx-surface-ground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageHeaderHeadingLevelExample {}
