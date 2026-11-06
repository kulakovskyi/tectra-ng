import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxColorPicker } from '@tectra-ng/ui/color-picker';
import { TxExportExcel, TxExportField, TxExportOptions } from '@tectra-ng/ui/export';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';

interface Sale {
  region: string;
  month: Date;
  revenue: number;
  margin: number;
}

@Component({
  selector: 'export-excel-example',
  imports: [FormsModule, TxExportExcel, TxCheckbox, TxColorPicker, TxField, TxInput, TxSelect],
  template: `
    <div class="grid">
      <tx-field label="Sheet name">
        <input txInput [fluid]="true" [ngModel]="sheet()" (ngModelChange)="sheet.set($event)" />
      </tx-field>
      <tx-field label="Number format">
        <tx-select
          ariaLabel="Number format"
          [options]="numberFormats"
          [ngModel]="numberFormat()"
          (ngModelChange)="numberFormat.set($event)"
        />
      </tx-field>
      <tx-field label="Date format">
        <tx-select
          ariaLabel="Date format"
          [options]="dateFormats"
          [ngModel]="dateFormat()"
          (ngModelChange)="dateFormat.set($event)"
        />
      </tx-field>
      <tx-field label="Header background">
        <tx-color-picker
          [ngModel]="headerBackground()"
          (ngModelChange)="headerBackground.set($event)"
        />
      </tx-field>
    </div>
    <div class="checks">
      <tx-checkbox
        label="Freeze the header"
        [binary]="true"
        [ngModel]="freeze()"
        (ngModelChange)="freeze.set($event)"
      />
      <tx-checkbox
        label="Filter buttons"
        [binary]="true"
        [ngModel]="filter()"
        (ngModelChange)="filter.set($event)"
      />
      <tx-checkbox
        label="Bold header"
        [binary]="true"
        [ngModel]="bold()"
        (ngModelChange)="bold.set($event)"
      />
      <tx-checkbox
        label="Fit columns to content"
        [binary]="true"
        [ngModel]="autoWidth()"
        (ngModelChange)="autoWidth.set($event)"
      />
    </div>
    <tx-export-excel
      label="Download .xlsx"
      filename="sales"
      [data]="sales"
      [fields]="fields"
      [options]="options()"
    />
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px 16px;
      width: 100%;
    }
    .checks {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;
      margin: 16px 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportExcelExample {
  readonly sheet = signal('Sales 2026');
  readonly numberFormat = signal('#,##0.00');
  readonly dateFormat = signal('mmm yyyy');
  readonly headerBackground = signal('#dbeafe');
  readonly freeze = signal(true);
  readonly filter = signal(true);
  readonly bold = signal(true);
  readonly autoWidth = signal(true);
  readonly numberFormats = [
    { label: '1,234.50', value: '#,##0.00' },
    { label: '1234.5', value: 'General' },
    { label: '1,235', value: '#,##0' },
    { label: '€1,234.50', value: '[$€-x-euro2] #,##0.00' },
  ];
  readonly dateFormats = [
    { label: 'Oct 2026', value: 'mmm yyyy' },
    { label: '01.10.2026', value: 'dd.mm.yyyy' },
    { label: '2026-10-01', value: 'yyyy-mm-dd' },
  ];
  readonly fields: TxExportField<Sale>[] = [
    { field: 'region', title: 'Region', width: 18 },
    { field: 'month', title: 'Month', type: 'date' },
    { field: 'revenue', title: 'Revenue' },
    { field: 'margin', title: 'Margin', format: '0.0%' },
  ];
  readonly sales: Sale[] = ['North', 'South', 'West', 'Захід'].flatMap((region, index) =>
    [8, 9, 10].map((month) => ({
      region,
      month: new Date(2026, month, 1),
      revenue: 12000 + index * 3150.25 + month * 410.5,
      margin: 0.18 + index * 0.03,
    })),
  );
  readonly options = computed<TxExportOptions>(() => ({
    excel: {
      sheetName: this.sheet(),
      numberFormat: this.numberFormat(),
      dateFormat: this.dateFormat(),
      headerBackground: this.headerBackground() || 'none',
      freezeHeader: this.freeze(),
      autoFilter: this.filter(),
      headerBold: this.bold(),
      autoWidth: this.autoWidth(),
    },
  }));
}
