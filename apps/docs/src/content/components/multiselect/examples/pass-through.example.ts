import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';

@Component({
  selector: 'multiselect-pass-through-example',
  imports: [TxMultiselect, ReactiveFormsModule],
  template: `<tx-multiselect
    [options]="skills"
    [formControl]="selected"
    [display]="'chip'"
    [pt]="pt"
    [ariaLabel]="'Skills'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectPassThroughExample {
  readonly skills = [
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Node.js', value: 'node' },
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'Docker', value: 'docker' },
    { label: 'Figma', value: 'figma' },
  ];
  readonly selected = new FormControl(['figma', 'angular']);
  readonly pt = {
    chip: { style: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' } },
    toggleAll: { style: { fontWeight: '600' } },
  };
}
