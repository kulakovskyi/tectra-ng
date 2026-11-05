import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTag } from '@tectra/ui/tag';

@Component({
  selector: 'tag-removable-example',
  imports: [TxTag],
  template: `
    <div class="row">
      @for (label of labels(); track label) {
        <tx-tag
          severity="secondary"
          [removable]="true"
          [removeLabel]="'Remove ' + label"
          (removed)="remove(label)"
          >{{ label }}</tx-tag
        >
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagRemovableExample {
  readonly labels = signal(['bug', 'needs review', 'frontend']);

  remove(label: string): void {
    this.labels.update((labels) => labels.filter((item) => item !== label));
  }
}
