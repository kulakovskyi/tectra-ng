import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxExportCsv, TxExportField } from '@tectra-ng/ui/export';

@Component({
  selector: 'export-pass-through-example',
  imports: [TxExportCsv],
  template: `<tx-export-csv label="Export" [data]="rows" [fields]="fields" [pt]="pt" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportPassThroughExample {
  readonly fields: TxExportField[] = [{ field: 'name', title: 'Name' }];
  readonly rows = [{ name: 'Ada' }, { name: 'Alan' }];
  readonly pt = {
    button: { style: { minWidth: '160px', borderRadius: 'var(--tx-radius-full)' } },
  };
}
