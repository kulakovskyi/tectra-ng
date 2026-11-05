import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TxThemeService } from '@tectra/core/config';
import { TxIcon } from '@tectra/icons';
import { TxButton } from '@tectra/ui/button';
import { DOC_NAVIGATION } from '../data/navigation.data';

@Component({
  selector: 'docs-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TxButton, TxIcon],
  templateUrl: './docs-layout.html',
  styleUrl: './docs-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsLayout {
  private txThemeService = inject(TxThemeService);

  readonly navigation = DOC_NAVIGATION;
  readonly mode = this.txThemeService.mode;

  toggleMode(): void {
    this.txThemeService.toggleMode();
  }
}
