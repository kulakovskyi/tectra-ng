import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxMultiselect } from '@tectra/ui/multiselect';

@Component({
  selector: 'multiselect-states-example',
  imports: [TxMultiselect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-multiselect
        [options]="skills"
        [formControl]="required"
        [placeholder]="'Required — open and close'"
      />
      <tx-multiselect [options]="skills" [formControl]="locked" [ariaLabel]="'Disabled'" />
      <tx-multiselect
        [options]="skills"
        [formControl]="shown"
        [readonly]="true"
        [variant]="'filled'"
        [ariaLabel]="'Read only'"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectStatesExample {
  readonly skills = [
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Node.js', value: 'node' },
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'Docker', value: 'docker' },
    { label: 'Figma', value: 'figma' },
  ];
  readonly required = new FormControl<string[]>([], Validators.required);
  readonly locked = new FormControl({ value: ['angular'], disabled: true });
  readonly shown = new FormControl(['node', 'docker']);
}
