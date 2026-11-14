import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';

@Component({
  selector: 'multiselect-chips-example',
  imports: [TxMultiselect, ReactiveFormsModule],
  template: `<tx-multiselect
    [options]="skills"
    [formControl]="selected"
    [display]="'chip'"
    [showClear]="true"
    [maxSelectedLabels]="10"
    [placeholder]="'Skills'"
  />`,
  styles: `
    tx-multiselect {
      width: 20rem;
      max-width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectChipsExample {
  readonly skills = [
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Node.js', value: 'node' },
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'Docker', value: 'docker' },
    { label: 'Figma', value: 'figma' },
  ];
  readonly selected = new FormControl<string[]>([
    'angular',
    'typescript',
    'rxjs',
    'postgres',
    'docker',
  ]);
}
