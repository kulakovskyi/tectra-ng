import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressBar } from '@tectra/ui/progress-bar';

@Component({
  selector: 'progress-bar-severities-example',
  imports: [TxProgressBar],
  template: `
    <div class="list">
      <tx-progress-bar [value]="100" severity="success" [showValue]="true" ariaLabel="Backup" />
      <tx-progress-bar [value]="86" severity="warn" [showValue]="true" ariaLabel="Quota" />
      <tx-progress-bar [value]="97" severity="danger" [showValue]="true" ariaLabel="Disk" />
      <tx-progress-bar [value]="40" severity="secondary" [showValue]="true" ariaLabel="Draft" />
      <tx-progress-bar [value]="60" color="#0d9488" [showValue]="true" ariaLabel="Custom colour" />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 14px;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressBarSeveritiesExample {}
