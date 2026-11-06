import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';

@Component({
  selector: 'multiselect-selection-limit-example',
  imports: [TxMultiselect],
  template: `<tx-multiselect
    [options]="skills"
    [selectionLimit]="3"
    [display]="'chip'"
    [placeholder]="'Top 3 skills'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectSelectionLimitExample {
  readonly skills = [
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Node.js', value: 'node' },
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'Docker', value: 'docker' },
    { label: 'Figma', value: 'figma' },
  ];
}
