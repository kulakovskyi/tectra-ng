import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToolbar, TxToolbarEnd, TxToolbarStart } from '@tectra-ng/ui/toolbar';

@Component({
  selector: 'toolbar-design-tokens-example',
  imports: [TxToolbar, TxToolbarStart, TxToolbarEnd, TxButton],
  template: `
    <tx-toolbar
      ariaLabel="Formatting"
      [dt]="{
        root: {
          background: 'var(--tx-surface-ground)',
          borderColor: 'transparent',
          padding: '4px',
        },
        group: { gap: '2px' },
      }"
    >
      <button
        txButton
        txToolbarStart
        text
        severity="secondary"
        icon="bold"
        aria-label="Bold"
      ></button>
      <button
        txButton
        txToolbarStart
        text
        severity="secondary"
        icon="italic"
        aria-label="Italic"
      ></button>
      <button
        txButton
        txToolbarStart
        text
        severity="secondary"
        icon="align-left"
        aria-label="Align left"
      ></button>
      <button
        txButton
        txToolbarStart
        text
        severity="secondary"
        icon="align-center"
        aria-label="Align center"
      ></button>
      <button
        txButton
        txToolbarEnd
        text
        severity="secondary"
        icon="undo"
        aria-label="Undo"
      ></button>
    </tx-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToolbarDesignTokensExample {}
