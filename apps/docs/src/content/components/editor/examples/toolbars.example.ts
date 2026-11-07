import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxEditor, TxEditorToolbar } from '@tectra-ng/editor';
import { TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'editor-toolbars-example',
  imports: [TxEditor, TxTabs],
  template: `
    <tx-tabs ariaLabel="Toolbar" variant="pills" [tabs]="tabs" [(value)]="preset" />
    <tx-editor class="editor" [toolbar]="toolbar()" html="<p>Pick a toolbar above.</p>" />
  `,
  styles: `
    .editor {
      margin-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorToolbarsExample {
  readonly tabs = [
    { value: 'full', label: 'Full' },
    { value: 'compact', label: 'Compact' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'custom', label: 'Custom' },
    { value: 'none', label: 'None' },
  ];
  readonly preset = signal('compact');
  readonly toolbar = computed<TxEditorToolbar>(() => {
    const preset = this.preset();
    return preset === 'custom'
      ? [
          ['bold', 'italic', 'highlight'],
          ['taskList', 'link', 'video'],
          ['undo', 'redo'],
        ]
      : (preset as TxEditorToolbar);
  });
}
