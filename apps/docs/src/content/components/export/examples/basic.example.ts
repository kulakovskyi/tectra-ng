import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxExportCsv, TxExportField } from '@tectra-ng/ui/export';

interface Member {
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'export-basic-example',
  imports: [TxExportCsv],
  template: `<tx-export-csv filename="members" [data]="members" [fields]="fields" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportBasicExample {
  readonly fields: TxExportField<Member>[] = [
    { field: 'number', title: '#' },
    { field: 'name', title: 'Name' },
    { field: 'email', title: 'Email' },
    { field: 'role', title: 'Role' },
  ];
  readonly members: Member[] = [
    { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner' },
    { name: 'Оксана Коваль', email: 'oksana@example.com', role: 'Editor' },
    { name: 'Grace Hopper', email: 'grace@example.com', role: 'Viewer' },
  ];
}
