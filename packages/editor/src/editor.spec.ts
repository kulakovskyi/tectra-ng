import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { TxEditor } from './editor.component';
import { TxEditorToolbarEnd } from './editor.slots';
import { TxEditorToolbar } from './editor.types';

@Component({
  imports: [TxEditor, ReactiveFormsModule, TxEditorToolbarEnd],
  template: `
    <tx-editor
      [formControl]="control"
      [toolbar]="toolbar()"
      [format]="format()"
      [maxLength]="maxLength()"
      placeholder="Describe the task"
      ariaLabel="Task description"
      ai
      [dt]="{ toolbar: { gap: '3px' } }"
      [pt]="{ toolbar: { class: 'own-toolbar' } }"
      (aiRequested)="ai.push($event)"
    >
      <span txEditorToolbarEnd class="own-end">Saved</span>
    </tx-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly editor = viewChild.required(TxEditor);
  readonly control = new FormControl<string>('<p>Hello <strong>world</strong></p>');
  readonly toolbar = signal<TxEditorToolbar>('full');
  readonly format = signal<'html' | 'quill'>('html');
  readonly maxLength = signal<number | undefined>(undefined);
  readonly ai: string[] = [];
}

const rect = { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) } as DOMRect;

beforeAll(() => {
  Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect ??= () => rect;
});

describe('TxEditor', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const tool = (name: string) => el(`[data-tool-name="${name}"]`) as HTMLButtonElement;
  const view = () => fixture.componentInstance.editor().editorView as EditorView;
  const selectText = (text: string) => {
    const state = view().state;
    let from = -1;
    state.doc.descendants((node, pos) => {
      if (from === -1 && node.isText && node.text?.includes(text)) {
        from = pos + (node.text?.indexOf(text) ?? 0);
      }
      return from === -1;
    });
    view().dispatch(state.tr.setSelection(TextSelection.create(state.doc, from, from + text.length)));
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  it('renders the value in a named textbox with a toolbar', () => {
    const textbox = el('[role="textbox"]');
    expect(textbox.getAttribute('aria-label')).toBe('Task description');
    expect(textbox.getAttribute('aria-multiline')).toBe('true');
    expect(textbox.innerHTML).toContain('<strong>world</strong>');
    const toolbar = el('[role="toolbar"]');
    expect(toolbar.classList).toContain('own-toolbar');
    expect(toolbar.getAttribute('aria-controls')).toBe(textbox.id);
    expect(el('.own-end').textContent).toBe('Saved');
    expect(tool('bold').getAttribute('aria-label')).toBe('Bold');
    expect(tool('blockStyle').textContent).toContain('Normal text');
    expect(el('tx-editor').style.getPropertyValue('--tx-editor-toolbar-gap')).toBe('3px');
  });

  it('applies toolbar commands and updates the form control', async () => {
    selectText('Hello');
    await fixture.whenStable();
    tool('italic').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('<p><em>Hello</em> <strong>world</strong></p>');
    expect(tool('italic').getAttribute('aria-pressed')).toBe('true');
    tool('bulletList').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('<ul><li><p><em>Hello</em> <strong>world</strong></p></li></ul>');
    view().dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', ctrlKey: true, bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('<p><em>Hello</em> <strong>world</strong></p>');
  });

  it('reads Quill HTML from the form and writes Quill HTML in quill format', async () => {
    fixture.componentInstance.format.set('quill');
    fixture.componentInstance.control.setValue('<ol><li data-list="bullet"><span class="ql-ui"></span>One</li></ol><p class="ql-align-center">Mid</p>');
    await fixture.whenStable();
    expect(el('[role="textbox"] ul li p').textContent).toBe('One');
    selectText('Mid');
    tool('bold').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('<ol><li data-list="bullet">One</li></ol><p class="ql-align-center"><strong>Mid</strong></p>');
  });

  it('moves focus along the toolbar with the arrow keys', async () => {
    const buttons = all('[data-tool]');
    expect(buttons.filter((button) => button.getAttribute('tabindex') === '0')).toHaveLength(1);
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons[1]);
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(buttons.at(-1));
  });

  it('emits the HTML for the AI button and toggles the full view', async () => {
    el('.tx-editor__ai').click();
    expect(fixture.componentInstance.ai).toEqual(['<p>Hello <strong>world</strong></p>']);
    const full = all('[data-tool]').at(-1) as HTMLButtonElement;
    full.click();
    await fixture.whenStable();
    expect(el('tx-editor').classList).toContain('tx-editor--full');
    expect(document.querySelector('[role="dialog"] .tx-editor__full-host > .tx-editor__frame')).not.toBeNull();
    expect(el('tx-editor > .tx-editor__frame')).toBeNull();
    (document.querySelector('[role="dialog"] [data-tool]:last-of-type[aria-pressed="true"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();
    expect(el('tx-editor').classList).not.toContain('tx-editor--full');
    expect(el('tx-editor .tx-editor__frame')).not.toBeNull();
  });

  it('adds a link from the link popover', async () => {
    selectText('world');
    tool('link').click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    const field = document.querySelector('.tx-editor__form input') as HTMLInputElement;
    expect(field).not.toBeNull();
    field.value = 'example.com';
    field.dispatchEvent(new Event('input'));
    (document.querySelector('.tx-editor__form') as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(
      '<p>Hello <a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow"><strong>world</strong></a></p>',
    );
  });

  it('counts characters and keeps the limit', async () => {
    fixture.componentInstance.maxLength.set(11);
    await fixture.whenStable();
    expect(el('.tx-editor__count').textContent?.trim()).toBe('11 / 11');
    const state = view().state;
    view().dispatch(state.tr.insertText('!', 1));
    expect(fixture.componentInstance.control.value).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('turns off editing and the tools when disabled', async () => {
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(el('[role="textbox"]').getAttribute('contenteditable')).toBe('false');
    expect(tool('bold').disabled).toBe(true);
    expect(el('tx-editor').classList).toContain('tx-editor--disabled');
  });

  it('switches presets and hides the toolbar', async () => {
    fixture.componentInstance.toolbar.set('minimal');
    await fixture.whenStable();
    expect(all('[data-tool-name]').map((button) => button.getAttribute('data-tool-name'))).toEqual(['bold', 'italic', 'underline', 'bulletList', 'orderedList', 'link']);
    fixture.componentInstance.toolbar.set([['bold', 'textColor']]);
    await fixture.whenStable();
    expect(all('[data-tool-name]')).toHaveLength(2);
  });
});
