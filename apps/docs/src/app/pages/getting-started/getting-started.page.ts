import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { INSTALL_STEPS } from '../../data/install.data';

@Component({
  selector: 'docs-getting-started-page',
  imports: [TxButton],
  templateUrl: './getting-started.page.html',
  styleUrls: ['../page.scss', './getting-started.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GettingStartedPage {
  readonly steps = INSTALL_STEPS;
  copiedIndex = signal<number | null>(null);

  copy(index: number, code: string): void {
    navigator.clipboard?.writeText(code);
    this.copiedIndex.set(index);
    setTimeout(() => this.copiedIndex.set(null), 1600);
  }
}
