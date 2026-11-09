import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';

@Component({
  selector: 'page-header-title-only-example',
  imports: [TxPageHeader],
  template: `
    <div class="ground">
      <tx-page-header title="Profile" />
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
export default class PageHeaderTitleOnlyExample {}
