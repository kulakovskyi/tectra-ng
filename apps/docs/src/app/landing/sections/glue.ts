import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { DocsLogoMark } from '../../layout/logo-mark/logo-mark';
import { GLUE_ORBIT, LIBRARIES, TALLIES } from '../landing.data';
import { DocsScrollProgress } from '../scroll-progress.directive';

@Component({
  selector: 'docs-landing-glue',
  imports: [TxIcon, DocsLogoMark, DocsScrollProgress],
  templateUrl: './glue.html',
  styleUrl: './glue.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingGlue {
  readonly libraries = LIBRARIES;
  readonly tallies = TALLIES;
  readonly orbit = GLUE_ORBIT;
}
