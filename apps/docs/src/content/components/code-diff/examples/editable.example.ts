import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxCodeDiff, TxCodeDiffSummary } from '@tectra-ng/code-editor';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTag } from '@tectra-ng/ui/tag';

@Component({
  selector: 'code-diff-editable-example',
  imports: [TxCodeDiff, TxButton, TxTag],
  template: `
    <div class="wrap">
      <div class="bar">
        <tx-tag severity="success" [value]="'+' + summary().added" />
        <tx-tag severity="danger" [value]="'−' + summary().removed" />
        <button
          txButton
          variant="outlined"
          size="small"
          label="Revert"
          (click)="value.set(original)"
        ></button>
      </div>
      <tx-code-diff
        language="css"
        [original]="original"
        [(value)]="value"
        height="240px"
        (changed)="summary.set($event)"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .bar {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeDiffEditableExample {
  readonly original = `.card {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}`;
  readonly value = signal(`.card {
  padding: 20px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
}`);
  readonly summary = signal<TxCodeDiffSummary>({ added: 0, removed: 0, changes: 0 });
}
