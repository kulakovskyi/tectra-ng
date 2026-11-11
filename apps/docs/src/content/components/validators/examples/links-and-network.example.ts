import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxValidators } from '@tectra-ng/utils/validators';

@Component({
  selector: 'validators-links-and-network-example',
  imports: [ReactiveFormsModule, TxField, TxInput],
  template: `
    <form class="form" [formGroup]="form">
      <tx-field
        label="Design file"
        hint="A link on example.com"
        [control]="form.controls.design"
        showImmediately
      >
        <input txInput formControlName="design" [fluid]="true" />
      </tx-field>
      <tx-field label="Allowed network" [control]="form.controls.network" showImmediately>
        <input txInput formControlName="network" [fluid]="true" />
      </tx-field>
      <tx-field label="Domain" [control]="form.controls.domain" showImmediately>
        <input txInput formControlName="domain" [fluid]="true" />
      </tx-field>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ValidatorsLinksAndNetworkExample {
  readonly form = new FormGroup({
    design: new FormControl(
      'http://files.example.com/board',
      TxValidators.url({ host: 'example.com' }),
    ),
    network: new FormControl('10.0.0.0/33', TxValidators.ip({ cidr: true, ipv6: true })),
    domain: new FormControl('shop.приклад.укр', TxValidators.domain()),
  });
}
