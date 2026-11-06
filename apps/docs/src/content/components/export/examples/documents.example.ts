import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import {
  TxExportButton,
  TxExportField,
  TxExportOptions,
  TxExportOrientation,
  TxExportPageSize,
  TxExportPdf,
  TxExportWord,
} from '@tectra-ng/ui/export';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';

interface Employee {
  name: string;
  team: string;
  city: string;
  started: Date;
  salary: number;
}

const NAMES = [
  'Ada Lovelace',
  'Оксана Коваль',
  'Alan Turing',
  'Grace Hopper',
  'Тарас Мельник',
  'Katherine Johnson',
  'Linus Pauling',
  'Ірина Бондар',
];
const TEAMS = ['Platform', 'Design', 'Data', 'Support'];
const CITIES = ['Lisbon', 'Київ', 'Oslo', 'Львів', 'Toronto'];

@Component({
  selector: 'export-documents-example',
  imports: [
    FormsModule,
    TxExportPdf,
    TxExportWord,
    TxExportButton,
    TxCheckbox,
    TxField,
    TxInput,
    TxSelect,
  ],
  template: `
    <div class="grid">
      <tx-field label="Title">
        <input txInput [fluid]="true" [ngModel]="title()" (ngModelChange)="title.set($event)" />
      </tx-field>
      <tx-field label="Page size">
        <tx-select
          ariaLabel="Page size"
          [options]="sizes"
          [ngModel]="pageSize()"
          (ngModelChange)="pageSize.set($event)"
        />
      </tx-field>
      <tx-field label="Orientation">
        <tx-select
          ariaLabel="Orientation"
          [options]="orientations"
          [ngModel]="orientation()"
          (ngModelChange)="orientation.set($event)"
        />
      </tx-field>
      <tx-field label="Font size">
        <tx-select
          ariaLabel="Font size"
          [options]="fontSizes"
          [ngModel]="fontSize()"
          (ngModelChange)="fontSize.set($event)"
        />
      </tx-field>
    </div>
    <div class="checks">
      <tx-checkbox
        label="Date under the title"
        [binary]="true"
        [ngModel]="showDate()"
        (ngModelChange)="showDate.set($event)"
      />
      <tx-checkbox
        label="Page numbers"
        [binary]="true"
        [ngModel]="pageNumbers()"
        (ngModelChange)="pageNumbers.set($event)"
      />
      <tx-checkbox
        label="Striped rows"
        [binary]="true"
        [ngModel]="striped()"
        (ngModelChange)="striped.set($event)"
      />
      <tx-checkbox
        label="Vertical lines"
        [binary]="true"
        [ngModel]="gridlines()"
        (ngModelChange)="gridlines.set($event)"
      />
    </div>
    <div class="row">
      <tx-export-pdf
        label="PDF"
        filename="team"
        [data]="people"
        [fields]="fields"
        [options]="options()"
      />
      <tx-export-word
        label="Word"
        variant="outlined"
        filename="team"
        [data]="people"
        [fields]="fields"
        [options]="options()"
      />
      <tx-export-button
        format="print"
        label="Print"
        variant="outlined"
        [data]="people"
        [fields]="fields"
        [options]="options()"
      />
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px 16px;
      width: 100%;
    }
    .checks {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;
      margin: 16px 0;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportDocumentsExample {
  readonly title = signal('Team directory');
  readonly pageSize = signal<TxExportPageSize>('a4');
  readonly orientation = signal<TxExportOrientation>('auto');
  readonly fontSize = signal(9);
  readonly showDate = signal(true);
  readonly pageNumbers = signal(true);
  readonly striped = signal(true);
  readonly gridlines = signal(false);
  readonly sizes = [
    { label: 'A4', value: 'a4' },
    { label: 'A3', value: 'a3' },
    { label: 'A5', value: 'a5' },
    { label: 'Letter', value: 'letter' },
    { label: 'Legal', value: 'legal' },
  ];
  readonly orientations = [
    { label: 'Auto', value: 'auto' },
    { label: 'Portrait', value: 'portrait' },
    { label: 'Landscape', value: 'landscape' },
  ];
  readonly fontSizes = [8, 9, 10, 11, 12].map((size) => ({ label: `${size} pt`, value: size }));
  readonly fields: TxExportField<Employee>[] = [
    { field: 'place', title: '#', width: 4 },
    { field: 'name', title: 'Name' },
    { field: 'team', title: 'Team' },
    { field: 'city', title: 'City' },
    { field: 'started', title: 'Started', type: 'date' },
    { field: 'salary', title: 'Salary, EUR' },
  ];
  readonly people: Employee[] = Array.from({ length: 64 }, (_, index) => ({
    name: NAMES[index % NAMES.length],
    team: TEAMS[index % TEAMS.length],
    city: CITIES[index % CITIES.length],
    started: new Date(2019 + (index % 7), index % 12, 1 + (index % 27)),
    salary: 42000 + ((index * 1375) % 38000),
  }));
  readonly options = computed<TxExportOptions>(() => {
    const page = {
      pageSize: this.pageSize(),
      orientation: this.orientation(),
      fontSize: this.fontSize(),
      pageNumbers: this.pageNumbers(),
      striped: this.striped(),
      gridlines: this.gridlines(),
    };
    return {
      title: this.title(),
      subtitle: `${this.people.length} people`,
      showDate: this.showDate(),
      pdf: page,
      word: page,
      print: { pageSize: page.pageSize, orientation: page.orientation },
    };
  });
}
