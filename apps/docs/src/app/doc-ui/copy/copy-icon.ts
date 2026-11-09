import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';

@Component({
  selector: 'docs-copy-icon',
  imports: [TxIcon],
  template: `<tx-icon class="copy-icon__copy" name="copy" /><tx-icon class="copy-icon__check" name="check" />`,
  styleUrl: './copy-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'copy-icon',
    'aria-hidden': 'true',
    '[class.copy-icon--done]': 'copied()',
  },
})
export class DocsCopyIcon {
  readonly copied = input(false);
}
