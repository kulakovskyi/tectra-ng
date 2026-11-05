import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTag, TxTagSeverity } from '@tectra/ui/tag';

@Component({
  selector: 'tag-severities-example',
  imports: [TxTag],
  template: `
    <div class="row">
      @for (severity of severities; track severity) {
        <tx-tag [severity]="severity" [value]="severity" />
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagSeveritiesExample {
  readonly severities: TxTagSeverity[] = [
    'primary',
    'secondary',
    'success',
    'info',
    'warn',
    'danger',
    'help',
    'contrast',
  ];
}
