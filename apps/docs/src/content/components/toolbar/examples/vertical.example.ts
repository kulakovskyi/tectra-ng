import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToolbar, TxToolbarEnd, TxToolbarStart } from '@tectra-ng/ui/toolbar';

@Component({
  selector: 'toolbar-vertical-example',
  imports: [TxToolbar, TxToolbarStart, TxToolbarEnd, TxButton],
  template: `
    <div class="row">
      <tx-toolbar class="toolbar" orientation="vertical" ariaLabel="Drawing tools">
        @for (tool of tools; track tool.icon) {
          <button
            txButton
            txToolbarStart
            [text]="picked() !== tool.label"
            [severity]="picked() === tool.label ? 'primary' : 'secondary'"
            [icon]="tool.icon"
            [attr.aria-label]="tool.label"
            [attr.aria-pressed]="picked() === tool.label"
            (click)="picked.set(tool.label)"
          ></button>
        }
        <button
          txButton
          txToolbarEnd
          text
          severity="danger"
          icon="trash"
          aria-label="Clear"
          (click)="picked.set('Clear')"
        ></button>
      </tx-toolbar>
      <p class="note">Tool: {{ picked() }}</p>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .note {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToolbarVerticalExample {
  readonly tools = [
    { label: 'Pencil', icon: 'pencil' },
    { label: 'Image', icon: 'image' },
    { label: 'Copy', icon: 'copy' },
  ];
  readonly picked = signal('Pencil');
}
