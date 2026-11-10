import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTruncateText } from '@tectra-ng/ui/truncate-text';

@Component({
  selector: 'truncate-text-link-example',
  imports: [TxTruncateText],
  template: `
    <div class="rows">
      <tx-truncate-text text="news.example.org" href="https://news.example.org" [limit]="30" />
      <tx-truncate-text
        text="https://example.com/blog/how-we-rebuilt-our-onboarding-in-two-weeks"
        [limit]="34"
        openLink
      />
    </div>
  `,
  styles: `
    .rows {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TruncateTextLinkExample {}
