import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KEYBOARD_COLUMNS } from '../../../../data/doc-columns.data';
import { DocTable } from '../../../../doc-ui/doc-table/doc-table';
import { DocComponent } from '../../../../types/doc-component.interface';

@Component({
  selector: 'docs-a11y-tab',
  imports: [DocTable],
  template: `<docs-table [title]="'Keyboard'" [columns]="keyboardColumns" [rows]="doc().keyboard" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A11yTab {
  doc = input.required<DocComponent>();

  readonly keyboardColumns = KEYBOARD_COLUMNS;
}
