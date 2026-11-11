import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCodeDiff } from '@tectra-ng/code-editor';
import { TxButton } from '@tectra-ng/ui/button';

const LINES = Array.from({ length: 60 }, (_, index) => `  <li>Item ${index + 1}</li>`);

@Component({
  selector: 'code-diff-navigation-example',
  imports: [TxCodeDiff, TxButton],
  template: `
    <div class="wrap">
      <div class="actions">
        <button
          txButton
          variant="outlined"
          size="small"
          icon="arrow-up"
          label="Previous"
          (click)="diff.previousChange()"
        ></button>
        <button
          txButton
          variant="outlined"
          size="small"
          icon="arrow-down"
          label="Next"
          (click)="diff.nextChange()"
        ></button>
      </div>
      <tx-code-diff #diff [original]="before" [value]="after" readOnly height="240px" />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeDiffNavigationExample {
  readonly before = ['<ul>', ...LINES, '</ul>'].join('\n');
  readonly after = [
    '<ul class="list">',
    ...LINES.map((line, index) =>
      index === 20
        ? '  <li>Item 21 (sold out)</li>'
        : index === 45
          ? '  <li class="new">Item 46</li>'
          : line,
    ),
    '  <li>Item 61</li>',
    '</ul>',
  ].join('\n');
}
