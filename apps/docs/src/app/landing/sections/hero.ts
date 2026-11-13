import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxButton } from '@tectra-ng/ui/button';
import { DOC_COMPONENTS } from '../../../generated/registry';
import { DocsClipboard } from '../../doc-ui/copy/clipboard.service';
import { DocsCopyIcon } from '../../doc-ui/copy/copy-icon';
import { DocsLogoMark } from '../../layout/logo-mark/logo-mark';
import { HERO_TILES, HERO_WORDS } from '../landing.data';
import { LandingShape } from '../parts/shape';
import { DocsScrollProgress } from '../scroll-progress.directive';

const CENTER_COL = 6;
const CENTER_ROW = 2;

@Component({
  selector: 'docs-landing-hero',
  imports: [RouterLink, TxButton, DocsCopyIcon, DocsLogoMark, LandingShape, DocsScrollProgress],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHero {
  private readonly clipboard = inject(DocsClipboard);

  readonly words = [...HERO_WORDS, HERO_WORDS[0]];
  readonly componentsLabel = `${Math.floor(DOC_COMPONENTS.length / 10) * 10}+`;
  readonly command = 'ng add tectra-ng';
  readonly copied = signal(false);
  readonly tiles = HERO_TILES.map((tile) => {
    const dx = tile.col - CENTER_COL;
    const dy = tile.row - CENTER_ROW;
    return {
      ...tile,
      dx,
      dy: dy === 0 ? (tile.col % 2 ? -0.6 : 0.6) : dy,
      order: Math.abs(dx) + Math.abs(dy),
      spin: (tile.col % 2 ? 1 : -1) * (20 + ((tile.col * 7 + tile.row * 13) % 25)),
    };
  });

  copy(): void {
    this.clipboard.copy(this.command);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1600);
  }
}
