import { ChangeDetectionStrategy, Component } from '@angular/core';
import { INSTALL_STEPS } from '../../data/install.data';

@Component({
  selector: 'docs-getting-started-page',
  templateUrl: './getting-started.page.html',
  styleUrl: '../page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GettingStartedPage {
  readonly steps = INSTALL_STEPS;
}
