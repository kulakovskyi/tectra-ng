import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CONTENT_ICON_DEFAULTS } from './content.icons';

@Component({
  selector: 'tx-editor-prose-styles',
  template: '',
  styleUrl: './editor-prose.styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideTxIconDefaults(CONTENT_ICON_DEFAULTS)],
})
export class TxEditorProseStyles {}
