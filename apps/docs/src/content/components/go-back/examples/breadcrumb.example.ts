import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxGoBack } from '@tectra-ng/utils/go-back';

@Component({
  selector: 'go-back-breadcrumb-example',
  imports: [TxIcon, TxGoBack],
  template: `
    <span class="back" [txGoBack]="['/components', 'table']">
      <tx-icon name="chevron-left" /> All components
    </span>
  `,
  styles: `
    .back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--tx-link-color);
      cursor: pointer;
      border-radius: var(--tx-radius-sm);
    }
    .back:focus-visible {
      outline: 2px solid var(--tx-focus-ring-color);
      outline-offset: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GoBackBreadcrumbExample {}
