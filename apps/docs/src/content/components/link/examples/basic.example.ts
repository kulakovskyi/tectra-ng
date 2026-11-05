import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxLink } from '@tectra/ui/link';

@Component({
  selector: 'link-basic-example',
  imports: [TxLink],
  template: `
    <div class="column">
      <tx-link link="docs.example.com" />
      <tx-link link="https://example.com/pricing" linkText="See pricing" />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkBasicExample {}
