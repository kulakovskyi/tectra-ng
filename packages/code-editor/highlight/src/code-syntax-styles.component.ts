import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { HIGHLIGHT_ICON_DEFAULTS } from './highlight.icons';

@Component({
  selector: 'tx-code-syntax-styles',
  template: '',
  styleUrl: './code-syntax.styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideTxIconDefaults(HIGHLIGHT_ICON_DEFAULTS)],
})
export class TxCodeSyntaxStyles {}
