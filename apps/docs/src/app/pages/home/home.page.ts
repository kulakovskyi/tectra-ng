import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TxButton } from '@tectra/ui/button';
import { TxInput } from '@tectra/ui/input';
import { TxSelect } from '@tectra/ui/select';
import { HOME_LAYERS, HOME_ROLES } from '../../data/home.data';

@Component({
  selector: 'docs-home-page',
  imports: [RouterLink, ReactiveFormsModule, TxButton, TxInput, TxSelect],
  templateUrl: './home.page.html',
  styleUrls: ['../page.scss', './home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {
  readonly layers = HOME_LAYERS;
  readonly roles = HOME_ROLES;
  role = new FormControl<string | null>('developer');
}
