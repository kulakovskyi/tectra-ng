import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'page-header-design-tokens-example',
  imports: [TxPageHeader, TxButton],
  template: `
    <div class="ground">
      <tx-page-header
        title="Reports"
        subtitle="Weekly numbers of every project"
        [dt]="{
          root: { gap: '20px' },
          heading: { gap: '4px' },
          title: { fontSize: '24px', letterSpacing: '-0.03em' },
          subtitle: { fontSize: '14px' },
        }"
      >
        <button txButton severity="secondary" icon="filter">Filter</button>
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
export default class PageHeaderDesignTokensExample {}
