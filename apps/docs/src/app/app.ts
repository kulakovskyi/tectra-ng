import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TxToast } from '@tectra-ng/ui/toast';

@Component({
  selector: 'docs-root',
  imports: [RouterOutlet, TxToast],
  template: '<router-outlet /><tx-toast />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
