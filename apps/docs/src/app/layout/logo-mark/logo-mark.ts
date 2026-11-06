import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LOGO_BLOCKS, LOGO_BLOCK_RADIUS, LOGO_BLOCK_SIZE, LOGO_RADIUS, LOGO_SIZE } from './logo-blocks.data';

@Component({
  selector: 'docs-logo-mark',
  templateUrl: './logo-mark.html',
  styleUrl: './logo-mark.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class DocsLogoMark {
  readonly size = LOGO_SIZE;
  readonly radius = LOGO_RADIUS;
  readonly blockSize = LOGO_BLOCK_SIZE;
  readonly blockRadius = LOGO_BLOCK_RADIUS;
  readonly blocks = LOGO_BLOCKS;
}
