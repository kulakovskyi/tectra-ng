import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxInput } from '@tectra/ui/input';
import { TxInputGroup } from '@tectra/ui/input-group';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'input-group-select-example',
  imports: [TxInputGroup, TxInput, TxSelect, ReactiveFormsModule],
  template: `
    <tx-input-group [fluid]="true" class="group">
      <tx-select class="group__select" [options]="protocols" [formControl]="protocol" [ariaLabel]="'Protocol'" />
      <input txInput placeholder="example.com" aria-label="Domain" />
    </tx-input-group>
  `,
  styles: `.group { max-width: 420px; } .group__select { flex: 0 0 120px !important; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputGroupSelectExample {
  readonly protocols = [
    { label: 'https://', value: 'https' },
    { label: 'http://', value: 'http' },
  ];
  readonly protocol = new FormControl('https');
}
