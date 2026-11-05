import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MEMBER_COLUMNS, SLOT_COLUMNS } from '../../../../data/doc-columns.data';
import { DocTable } from '../../../../doc-ui/doc-table/doc-table';
import { DocComponent } from '../../../../types/doc-component.interface';

@Component({
  selector: 'docs-api-tab',
  imports: [DocTable],
  template: `
    <p class="hint">Selector <code>{{ doc().selector }}</code></p>
    <docs-table [title]="'Inputs'" [columns]="memberColumns" [rows]="doc().api.inputs" />
    <docs-table [title]="'Outputs'" [columns]="memberColumns" [rows]="doc().api.outputs" />
    <docs-table [title]="'Slots'" [columns]="slotColumns" [rows]="doc().api.slots" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiTab {
  doc = input.required<DocComponent>();

  readonly memberColumns = MEMBER_COLUMNS;
  readonly slotColumns = SLOT_COLUMNS;
}
