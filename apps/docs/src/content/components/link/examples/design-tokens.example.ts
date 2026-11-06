import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxLink } from '@tectra-ng/ui/link';

@Component({
  selector: 'link-design-tokens-example',
  imports: [TxLink],
  template: `
    <tx-link
      link="status.example.com"
      [copyable]="true"
      [dt]="{
        root: {
          color: 'var(--tx-text-primary)',
          hoverColor: 'var(--tx-primary-soft-text)',
          underlineOffset: '4px',
        },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkDesignTokensExample {}
