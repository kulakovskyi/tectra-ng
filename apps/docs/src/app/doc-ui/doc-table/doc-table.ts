import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocTableColumn } from '../../types/doc-table.interface';

@Component({
  selector: 'docs-table',
  templateUrl: './doc-table.html',
  styleUrl: './doc-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocTable {
  title = input<string>('');
  columns = input.required<DocTableColumn[]>();
  rows = input.required<object[]>();
}
