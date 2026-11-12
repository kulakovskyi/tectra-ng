import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TX_LOCALE_UA } from '@tectra-ng/core/i18n/ua';
import { Slice } from 'prosemirror-model';
import { NodeSelection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { TxEditor } from './editor.component';
import { TxEditorToolbarEnd } from './editor.slots';
import { shortcutLabel } from './editor.toolbar';
import {
  TxEditorAiAction,
  TxEditorAiRequest,
  TxEditorImageRejection,
  TxEditorImageUpload,
  TxEditorMentionItem,
  TxEditorMentionSource,
  TxEditorSelection,
  TxEditorTextChange,
  TxEditorToolbar,
} from './editor.types';
import { aiKey } from './engine/ai';

@Component({
  imports: [TxEditor, TxEditorToolbarEnd],
  template: `
    <tx-editor
      [(html)]="html"
      [toolbar]="toolbar()"
      [format]="format()"
      [headingLevels]="headingLevels()"
      [placeholder]="placeholder()"
      [readonly]="readonly()"
      [disabled]="disabled()"
      [invalid]="invalid()"
      [height]="height()"
      [minHeight]="minHeight()"
      [maxHeight]="maxHeight()"
      [maxLength]="maxLength()"
      [showCount]="showCount()"
      [linkTarget]="linkTarget()"
      [imageUpload]="imageUpload()"
      [maxImageSize]="maxImageSize()"
      [mentions]="mentions()"
      [slashMenu]="slashMenu()"
      [emoji]="emoji()"
      [typography]="typography()"
      [draftKey]="draftKey()"
      [selectionMenu]="selectionMenu()"
      [ai]="ai()"
      [aiLabel]="aiLabel()"
      [aiActions]="aiActions()"
      [fullViewButton]="fullViewButton()"
      [ariaLabelledBy]="ariaLabelledBy()"
      [textColors]="textColors()"
      (textChange)="changes.push($event)"
      (selectionChange)="selections.push($event)"
      (focused)="events.push('focus')"
      (blurred)="events.push('blur')"
      (ready)="events.push('ready')"
      (aiAction)="requests.push($event)"
      (imageRejected)="rejections.push($event)"
      (mentionSelected)="mentioned.push($event)"
      (draftRestored)="drafts.push($event)"
    >
      @if (end()) {
        <span txEditorToolbarEnd class="own-end">Saved</span>
      }
    </tx-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly editor = viewChild.required(TxEditor);
  readonly html = signal('<p>Hello <strong>world</strong></p>');
  readonly toolbar = signal<TxEditorToolbar>('full');
  readonly format = signal<'html' | 'quill'>('html');
  readonly headingLevels = signal<readonly (1 | 2 | 3 | 4 | 5 | 6)[] | undefined>(undefined);
  readonly placeholder = signal('');
  readonly readonly = signal(false);
  readonly disabled = signal(false);
  readonly invalid = signal<boolean | undefined>(undefined);
  readonly height = signal<string | undefined>(undefined);
  readonly minHeight = signal<string | undefined>(undefined);
  readonly maxHeight = signal<string | undefined>(undefined);
  readonly maxLength = signal<number | undefined>(undefined);
  readonly showCount = signal(false);
  readonly linkTarget = signal<'_blank' | '_self'>('_blank');
  readonly imageUpload = signal<TxEditorImageUpload | undefined>(undefined);
  readonly maxImageSize = signal<number | undefined>(undefined);
  readonly mentions = signal<TxEditorMentionSource | undefined>(undefined);
  readonly slashMenu = signal(true);
  readonly emoji = signal(true);
  readonly typography = signal(true);
  readonly draftKey = signal<string | undefined>(undefined);
  readonly selectionMenu = signal(true);
  readonly ai = signal(false);
  readonly aiLabel = signal<string | undefined>(undefined);
  readonly aiActions = signal<readonly TxEditorAiAction[]>([]);
  readonly fullViewButton = signal<boolean | undefined>(undefined);
  readonly ariaLabelledBy = signal<string | undefined>(undefined);
  readonly textColors = signal([
    { label: 'editorColorRed', value: '#dc2626' },
    { label: 'Brand', value: '#123456' },
  ]);
  readonly end = signal(false);
  readonly changes: TxEditorTextChange[] = [];
  readonly selections: TxEditorSelection[] = [];
  readonly events: string[] = [];
  readonly requests: TxEditorAiRequest[] = [];
  readonly rejections: TxEditorImageRejection[] = [];
  readonly mentioned: TxEditorMentionItem[] = [];
  readonly drafts: string[] = [];
}

const zero = { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) } as DOMRect;

beforeAll(() => {
  Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect ??= () => zero;
  document.elementFromPoint ??= () => null;
});

describe('TxEditor features', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const editor = () => host.editor();
  const view = () => editor().editorView as EditorView;
  const html = () => editor().getHtml();
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };
  const create = async (setup: (value: Host) => void = () => undefined) => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    setup(host);
    await settle();
  };
  const el = <T extends HTMLElement = HTMLElement>(selector: string) => fixture.nativeElement.querySelector(selector) as T;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const page = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector(selector) as T | null;
  const tool = (name: string) => el<HTMLButtonElement>(`[data-tool-name="${name}"]`);
  const bubble = (label: string) => page<HTMLButtonElement>(`.tx-editor__bubble [aria-label="${label}"]`);
  const menuItem = (label: string) => Array.from(document.querySelectorAll<HTMLElement>('.tx-menu__item')).find((item) => item.textContent?.includes(label));
  const textPos = (text: string, offset = 0) => {
    let found = -1;
    view().state.doc.descendants((node, pos) => {
      if (found === -1 && node.isText && node.text?.includes(text)) {
        found = pos + (node.text?.indexOf(text) ?? 0) + offset;
      }
      return found === -1;
    });
    return found;
  };
  const select = (text: string) => {
    const from = textPos(text);
    view().dispatch(view().state.tr.setSelection(TextSelection.create(view().state.doc, from, from + text.length)));
  };
  const cursor = (pos: number) => view().dispatch(view().state.tr.setSelection(TextSelection.create(view().state.doc, pos)));
  const focus = async () => {
    vi.spyOn(view(), 'hasFocus').mockReturnValue(true);
    view().dom.dispatchEvent(new FocusEvent('focus'));
    await settle();
  };
  const type = (text: string) => {
    for (const char of text) {
      const { from, to } = view().state.selection;
      const handled = view().someProp('handleTextInput', (handler) => handler(view(), from, to, char, () => view().state.tr.insertText(char, from, to)));
      if (!handled) {
        view().dispatch(view().state.tr.insertText(char, from, to));
      }
    }
  };
  const unmeasurable = () => {
    const measure = view().coordsAtPos.bind(view());
    view().coordsAtPos = (pos: number, side?: number) => {
      if (side === undefined) {
        throw new Error('no layout');
      }
      return measure(pos, side);
    };
  };
  const press = (key: string, init: KeyboardEventInit = {}) => view().dom.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true, ...init }));
  const submit = (selector: string) => (page(selector) as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true }));
  const fill = (value: string) => {
    const field = page<HTMLInputElement>('.tx-editor__form input') as HTMLInputElement;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  };

  afterEach(() => {
    fixture?.destroy();
    document.body.querySelectorAll('.cdk-overlay-container').forEach((node) => (node.innerHTML = ''));
  });

  describe('setup', () => {
    it('renders without a toolbar and labels the content by another element', async () => {
      await create((value) => {
        value.toolbar.set('none');
        value.fullViewButton.set(false);
        value.ariaLabelledBy.set('title-id');
        value.height.set('200px');
        value.minHeight.set('80px');
        value.maxHeight.set('400px');
        value.showCount.set(true);
        value.invalid.set(true);
      });
      expect(el('[role="toolbar"]')).toBeNull();
      const textbox = el('[role="textbox"]');
      expect(textbox.getAttribute('aria-labelledby')).toBe('title-id');
      expect(textbox.hasAttribute('aria-label')).toBe(false);
      expect(textbox.getAttribute('aria-invalid')).toBe('true');
      const content = el('.tx-editor__content');
      expect([content.style.height, content.style.minHeight, content.style.maxHeight]).toEqual(['200px', '80px', '400px']);
      expect(el('.tx-editor__count').textContent?.trim()).toBe('11 characters');
      expect(host.events).toContain('ready');
    });

    it('offers the AI button alone and only two heading levels in smaller toolbars', async () => {
      await create((value) => {
        value.toolbar.set('compact');
        value.ai.set(true);
        value.aiLabel.set('Rewrite');
      });
      expect(el('.tx-editor__ai').getAttribute('aria-label')).toBe('Rewrite');
      expect(el('.tx-editor__ai').getAttribute('tabindex')).toBe('-1');
      tool('blockStyle').click();
      await settle();
      expect(menuItem('Heading 2')).toBeDefined();
      expect(menuItem('Heading 3')).toBeUndefined();
      host.toolbar.set('none');
      await settle();
      expect(el('.tx-editor__ai').getAttribute('tabindex')).toBe('0');
    });

    it('lists the heading levels it is given', async () => {
      await create((value) => value.headingLevels.set([4]));
      tool('blockStyle').click();
      await settle();
      expect(menuItem('Heading 4')).toBeDefined();
      expect(menuItem('Heading 1')).toBeUndefined();
    });

    it('turns typed quotes into the quotes of the locale', async () => {
      await create((value) => value.html.set(''));
      await TestBed.inject(TxLocaleService).setLocale(TX_LOCALE_UA);
      cursor(1);
      type('"a"');
      expect(editor().getText()).toBe('«a»');
    });

    it('stops typographic replacements when turned off', async () => {
      await create((value) => {
        value.html.set('');
        value.typography.set(false);
      });
      cursor(1);
      type('"a" --');
      expect(editor().getText()).toBe('"a" --');
    });
  });

  describe('public API', () => {
    it('reads, inserts, clears and focuses the content', async () => {
      await create();
      expect(html()).toBe('<p>Hello <strong>world</strong></p>');
      expect(editor().getText()).toBe('Hello world');
      view().dispatch(view().state.tr.setSelection(TextSelection.create(view().state.doc, 0, view().state.doc.content.size)));
      editor().insertHtml('<h2>New</h2>');
      expect(html()).toBe('<h2>New</h2>');
      expect(host.html()).toBe(html());
      expect(host.changes.at(-1)).toEqual({ html: '<h2>New</h2>', text: 'New' });
      const focusView = vi.spyOn(view(), 'focus');
      editor().focus();
      expect(focusView).toHaveBeenCalled();
      editor().clear();
      await settle();
      expect(html()).toBe('');
      expect(host.html()).toBe('');
      expect(host.changes.at(-1)).toEqual({ html: '', text: '' });
      editor().writeValue(null);
      await settle();
      expect(host.html()).toBe('');
    });

    it('follows the bound value and ignores the value it wrote itself', async () => {
      await create();
      host.html.set('<h2>Title</h2>');
      await settle();
      expect(el('[role="textbox"] h2').textContent).toBe('Title');
      expect(html()).toBe('<h2>Title</h2>');
      const dispatch = vi.spyOn(view(), 'dispatch');
      host.html.set('<h2>Title</h2>');
      await settle();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('reports selection changes with the selected text', async () => {
      await create();
      select('world');
      expect(host.selections.at(-1)).toEqual({ from: 7, to: 12, empty: false, text: 'world' });
    });
  });

  describe('focus', () => {
    it('tracks focus, keeps it for the toolbar and marks the control touched on blur', async () => {
      await create();
      await focus();
      expect(el('tx-editor').classList).toContain('tx-editor--focused');
      expect(host.events).toContain('focus');
      view().dom.dispatchEvent(new FocusEvent('blur', { relatedTarget: tool('bold') }));
      await settle();
      expect(el('tx-editor').classList).toContain('tx-editor--focused');
      view().dom.dispatchEvent(new FocusEvent('blur', { relatedTarget: document.body }));
      await settle();
      expect(el('tx-editor').classList).not.toContain('tx-editor--focused');
      expect(host.events).toContain('blur');
    });

    it('hides the selection menu while the pointer is down', async () => {
      await create();
      await focus();
      select('world');
      await settle();
      expect(page('.tx-editor__bubble')).not.toBeNull();
      view().dom.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await settle();
      expect(page('.tx-editor__bubble')).toBeNull();
      document.dispatchEvent(new MouseEvent('mouseup'));
      await settle();
      expect(page('.tx-editor__bubble')).not.toBeNull();
    });
  });

  describe('toolbar', () => {
    const all_tools: TxEditorToolbar = [
      ['undo', 'redo', 'blockStyle', 'fontSize', 'align'],
      ['subscript', 'superscript', 'textColor', 'highlight'],
      ['indent', 'outdent', 'video', 'image', 'horizontalRule', 'table', 'callout', 'codeBlock', 'bold'],
      [],
    ];

    it('enables undo and redo with the history', async () => {
      await create((value) => value.toolbar.set(all_tools));
      expect(tool('undo').disabled).toBe(true);
      expect(tool('redo').disabled).toBe(true);
      expect(tool('undo').getAttribute('aria-label')).toBe('Undo');
      expect(tool('undo').getAttribute('aria-pressed')).toBeNull();
      cursor(textPos('Hello', 5));
      type('!');
      await settle();
      expect(tool('undo').disabled).toBe(false);
      tool('undo').click();
      await settle();
      expect(html()).toBe('<p>Hello <strong>world</strong></p>');
      expect(tool('redo').disabled).toBe(false);
      tool('redo').click();
      await settle();
      expect(html()).toBe('<p>Hello! <strong>world</strong></p>');
    });

    it('picks block styles, sizes and alignment from menus', async () => {
      await create((value) => value.toolbar.set(all_tools));
      cursor(textPos('Hello', 1));
      tool('blockStyle').click();
      await settle();
      menuItem('Heading 2')?.click();
      await settle();
      expect(html()).toBe('<h2>Hello <strong>world</strong></h2>');
      expect(tool('blockStyle').textContent).toContain('Heading 2');
      tool('blockStyle').click();
      await settle();
      menuItem('Normal text')?.click();
      await settle();
      expect(html()).toBe('<p>Hello <strong>world</strong></p>');
      tool('align').click();
      await settle();
      menuItem('Align center')?.click();
      await settle();
      expect(html()).toBe('<p style="text-align: center;">Hello <strong>world</strong></p>');
      tool('align').click();
      await settle();
      menuItem('Align left')?.click();
      await settle();
      expect(html()).toBe('<p>Hello <strong>world</strong></p>');
      select('Hello');
      tool('fontSize').click();
      await settle();
      menuItem('Large')?.click();
      await settle();
      expect(html()).toBe('<p><span style="font-size: 1.5em;">Hello</span> <strong>world</strong></p>');
    });

    it('colours text and its background from swatches', async () => {
      await create((value) => value.toolbar.set(all_tools));
      select('Hello');
      tool('textColor').click();
      await settle();
      expect(page('.tx-editor__swatches')?.getAttribute('aria-label')).toBe('Text colour');
      page<HTMLButtonElement>('.tx-editor__swatch[aria-label="Red"]')?.click();
      await settle();
      expect(html()).toBe('<p><span style="color: rgb(220, 38, 38);">Hello</span> <strong>world</strong></p>');
      select('Hello');
      tool('highlight').click();
      await settle();
      expect(page('.tx-editor__swatches')?.getAttribute('aria-label')).toBe('Highlight');
      page<HTMLButtonElement>('.tx-editor__swatch[data-kind="highlight"][aria-label="Yellow"]')?.click();
      await settle();
      expect(html()).toBe('<p><span style="color: rgb(220, 38, 38); background-color: rgba(234, 179, 8, 0.28);">Hello</span> <strong>world</strong></p>');
      select('Hello');
      tool('textColor').click();
      await settle();
      expect(page('.tx-editor__swatch--none')?.getAttribute('aria-pressed')).toBe('false');
      page<HTMLButtonElement>('.tx-editor__swatch--none')?.click();
      await settle();
      expect(html()).toBe('<p><span style="background-color: rgba(234, 179, 8, 0.28);">Hello</span> <strong>world</strong></p>');
    });

    it('inserts videos from the video form and ignores unknown addresses', async () => {
      await create((value) => value.toolbar.set(all_tools));
      cursor(textPos('world', 5));
      tool('video').click();
      await settle();
      expect(page('.tx-editor__hint')?.textContent).toContain('YouTube');
      fill('https://youtu.be/dQw4w9WgXcQ');
      submit('.tx-editor__form');
      await settle();
      expect(html()).toContain('<iframe data-type="video" src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
      const before = html();
      tool('video').click();
      await settle();
      fill('not a link');
      submit('.tx-editor__form');
      await settle();
      expect(html()).toBe(before);
    });

    it('runs block commands and opens the file picker for images', async () => {
      await create((value) => value.toolbar.set(all_tools));
      const picker = el<HTMLInputElement>('.tx-editor__file');
      const click = vi.spyOn(picker, 'click');
      tool('image').click();
      expect(click).toHaveBeenCalled();
      cursor(textPos('Hello', 1));
      expect(tool('outdent').disabled).toBe(true);
      tool('indent').click();
      await settle();
      expect(html()).toBe('<p data-indent="1" style="margin-left: 3em;">Hello <strong>world</strong></p>');
      tool('outdent').click();
      tool('callout').click();
      await settle();
      expect(html()).toBe('<div data-type="callout" data-tone="info"><p>Hello <strong>world</strong></p></div>');
      expect(tool('callout').getAttribute('aria-pressed')).toBe('true');
      tool('horizontalRule').click();
      await settle();
      expect(html()).toContain('<hr>');
    });

    it('turns off inline tools inside code', async () => {
      await create((value) => {
        value.toolbar.set(all_tools);
        value.html.set('<pre><code>let a;</code></pre>');
      });
      cursor(2);
      await settle();
      expect(tool('bold').disabled).toBe(true);
      expect(tool('subscript').disabled).toBe(true);
      expect(tool('codeBlock').disabled).toBe(false);
      expect(tool('codeBlock').getAttribute('aria-pressed')).toBe('true');
      expect(tool('table').disabled).toBe(true);
      expect(tool('horizontalRule').disabled).toBe(false);
    });

    it('moves around the toolbar with arrows, Home and End and ignores other keys', async () => {
      await create((value) => value.toolbar.set('minimal'));
      const buttons = all('[data-tool]');
      buttons[0].focus();
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(document.activeElement).toBe(buttons.at(-1));
      buttons.at(-1)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(document.activeElement).toBe(buttons[0]);
      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(document.activeElement).toBe(buttons[0]);
      await settle();
      expect(buttons[0].getAttribute('tabindex')).toBe('0');
    });

    it('turns off the tools and link shortcuts when read-only', async () => {
      await create((value) => value.readonly.set(true));
      expect(tool('bold').disabled).toBe(true);
      expect(el('tx-editor').classList).toContain('tx-editor--readonly');
      press('k', { code: 'KeyK', ctrlKey: true });
      await settle();
      expect(page('.tx-editor__form')).toBeNull();
      host.readonly.set(false);
      await settle();
      host.disabled.set(true);
      await settle();
      expect(el('[role="textbox"]').getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('links', () => {
    it('inserts a linked address at the cursor', async () => {
      await create((value) => value.linkTarget.set('_self'));
      cursor(textPos('Hello', 5));
      press('k', { code: 'KeyK', ctrlKey: true });
      await settle();
      fill(' example.com ');
      submit('.tx-editor__form');
      await settle();
      expect(html()).toBe('<p>Hello<a href="https://example.com">example.com</a> <strong>world</strong></p>');
    });

    it('edits and removes a link from the selection menu', async () => {
      await create((value) => value.html.set('<p>See <a href="https://a.com" target="_blank">docs</a> now</p>'));
      await focus();
      cursor(textPos('docs', 2));
      await settle();
      expect(page('.tx-editor__bubble-link')?.getAttribute('href')).toBe('https://a.com');
      bubble('Edit link')?.click();
      await settle();
      expect(page<HTMLInputElement>('.tx-editor__form input')?.value).toBe('https://a.com');
      fill('');
      submit('.tx-editor__form');
      await settle();
      expect(html()).toBe('<p>See docs now</p>');
      select('docs');
      tool('link').click();
      await settle();
      fill('b.com');
      submit('.tx-editor__form');
      await settle();
      expect(html()).toBe('<p>See <a href="https://b.com" target="_blank" rel="noopener noreferrer nofollow">docs</a> now</p>');
      cursor(textPos('docs', 1));
      await settle();
      bubble('Remove link')?.click();
      await settle();
      expect(html()).toBe('<p>See docs now</p>');
    });

    it('removes a link from the link form', async () => {
      await create((value) => value.html.set('<p><a href="https://a.com">docs</a></p>'));
      select('docs');
      tool('link').click();
      await settle();
      (Array.from(document.querySelectorAll<HTMLButtonElement>('.tx-editor__form button')).find((button) => button.textContent?.includes('Remove link')) as HTMLButtonElement).click();
      await settle();
      expect(html()).toBe('<p>docs</p>');
    });

    it('opens the link form from the selection menu and applies bubble marks', async () => {
      await create();
      await focus();
      select('Hello');
      await settle();
      bubble('Italic')?.click();
      await settle();
      expect(html()).toBe('<p><em>Hello</em> <strong>world</strong></p>');
      expect(bubble('Italic')?.getAttribute('aria-pressed')).toBe('true');
      bubble('Link')?.click();
      await settle();
      expect(page('.tx-editor__form')).not.toBeNull();
    });
  });

  describe('selection menu', () => {
    it('edits tables from the menu under the table', async () => {
      await create((value) => value.html.set('<table><tr><th>A</th><th>B</th></tr><tr><td>C</td><td>D</td></tr></table>'));
      await focus();
      cursor(textPos('C', 1));
      await settle();
      const rows = () => view().state.doc.firstChild?.childCount;
      const columns = () => view().state.doc.firstChild?.firstChild?.childCount;
      bubble('Add row above')?.click();
      bubble('Add row below')?.click();
      expect(rows()).toBe(4);
      bubble('Add column on the left')?.click();
      bubble('Add column on the right')?.click();
      expect(columns()).toBe(4);
      bubble('Delete row')?.click();
      bubble('Delete column')?.click();
      expect([rows(), columns()]).toEqual([3, 3]);
      await settle();
      expect(bubble('Header row')?.getAttribute('aria-pressed')).toBe('true');
      bubble('Header row')?.click();
      await settle();
      expect(bubble('Header row')?.getAttribute('aria-pressed')).toBe('false');
      bubble('Delete table')?.click();
      await settle();
      expect(html()).toBe('');
    });

    it('hides for node selections, code and when turned off', async () => {
      await create((value) => value.html.set('<hr><pre><code>x</code></pre><p>text</p>'));
      await focus();
      view().dispatch(view().state.tr.setSelection(NodeSelection.create(view().state.doc, 0)));
      await settle();
      expect(page<HTMLElement>('.tx-editor__anchor')?.style.width).toBe('0px');
      view().dispatch(view().state.tr.setSelection(TextSelection.create(view().state.doc, 2, 3)));
      await settle();
      expect(page('.tx-editor__bubble')).toBeNull();
      select('text');
      await settle();
      expect(page('.tx-editor__bubble')).not.toBeNull();
      host.selectionMenu.set(false);
      await settle();
      expect(page('.tx-editor__bubble')).toBeNull();
    });

    it('survives positions it cannot measure', async () => {
      await create();
      await focus();
      unmeasurable();
      select('world');
      await settle();
      expect(page('.tx-editor__bubble')).not.toBeNull();
    });
  });

  describe('suggestions', () => {
    const people: TxEditorMentionItem[] = [
      { id: '1', label: 'Ann Lee', description: 'Design' },
      { id: '2', label: 'Bob', avatar: 'https://a.com/bob.png' },
    ];
    const options = () => Array.from(document.querySelectorAll<HTMLElement>('.tx-editor__suggestion'));
    const selected = () => options().findIndex((option) => option.getAttribute('aria-selected') === 'true');
    const start = async (setup: (value: Host) => void = () => undefined) => {
      await create((value) => {
        value.html.set('');
        value.mentions.set((query) => people.filter((person) => person.label.toLowerCase().includes(query.toLowerCase())));
        setup(value);
      });
      await focus();
      cursor(1);
    };

    it('suggests people, moves through them and inserts the picked mention', async () => {
      await start();
      type('@');
      await settle();
      expect(page('.tx-editor__suggestions')?.getAttribute('aria-label')).toBe('People');
      expect(options().map((option) => option.querySelector('.tx-editor__suggestion-label')?.textContent)).toEqual(['Ann Lee', 'Bob']);
      expect(options()[0].querySelector('.tx-editor__avatar')?.textContent).toBe('AL');
      expect(options()[0].querySelector('.tx-editor__suggestion-description')?.textContent).toBe('Design');
      expect(page<HTMLImageElement>('.tx-editor__suggestion img')?.src).toBe('https://a.com/bob.png');
      expect(view().dom.getAttribute('aria-activedescendant')).toBe(options()[0].id);
      press('ArrowDown');
      await settle();
      expect(selected()).toBe(1);
      press('ArrowUp');
      press('ArrowUp');
      await settle();
      expect(selected()).toBe(1);
      options()[0].dispatchEvent(new MouseEvent('mouseenter'));
      await settle();
      expect(selected()).toBe(0);
      press('b', { code: 'KeyB' });
      press('Enter');
      await settle();
      expect(html()).toBe('<p><span data-type="mention" data-id="1" data-label="Ann Lee">@Ann Lee</span> </p>');
      expect(host.mentioned).toEqual([people[0]]);
      expect(view().dom.hasAttribute('aria-activedescendant')).toBe(false);
      expect(page('.tx-editor__suggestions')).toBeNull();
    });

    it('shows an empty list for unknown people and picks with a click', async () => {
      await start();
      type('@zz');
      await settle();
      expect(page('.tx-editor__suggestion-empty')?.textContent).toBe('No matches');
      expect(press('ArrowDown')).toBe(false);
      expect(press('Escape')).toBe(false);
      await settle();
      expect(page('.tx-editor__suggestions')).toBeNull();
      type(' @bo');
      await settle();
      options()[0].click();
      await settle();
      expect(html()).toBe('<p>@zz <span data-type="mention" data-id="2" data-label="Bob">@Bob</span> </p>');
    });

    it('drops answers that arrive after a newer query', async () => {
      let resolveFirst: (items: readonly TxEditorMentionItem[]) => void = () => undefined;
      await start((value) =>
        value.mentions.set((query) => (query === 'a' ? new Promise<readonly TxEditorMentionItem[]>((resolve) => (resolveFirst = resolve)) : [people[1]])),
      );
      type('@a');
      type('b');
      await settle();
      resolveFirst([people[0]]);
      await settle();
      expect(options().map((option) => option.textContent?.trim())).toEqual(['Bob']);
    });

    it('lists slash commands and runs them', async () => {
      await start();
      type('/');
      await settle();
      expect(page('.tx-editor__suggestions')?.getAttribute('aria-label')).toBe('Insert block');
      expect(options()).toHaveLength(14);
      expect(options()[1].textContent).toContain('Heading 1');
      expect(options()[1].querySelector('kbd')?.textContent).toBe('Ctrl+Alt+1');
      type('tab');
      await settle();
      press('Tab');
      await settle();
      expect(html()).toContain('<table>');
    });

    it('opens the image picker and the video form from slash commands', async () => {
      await start();
      const picker = el<HTMLInputElement>('.tx-editor__file');
      const click = vi.spyOn(picker, 'click').mockImplementation(() => undefined);
      type('/image');
      await settle();
      options()[0].click();
      await settle();
      expect(click).toHaveBeenCalled();
      type('/video');
      await settle();
      press('Enter');
      await settle();
      expect(page('.tx-editor__hint')).not.toBeNull();
    });

    it('wraps blocks in a callout and hides an empty command list', async () => {
      await start();
      type('/call');
      await settle();
      expect(options()[0].querySelector('kbd')).toBeNull();
      press('Enter');
      await settle();
      expect(html()).toBe('<div data-type="callout" data-tone="info"><p><br></p></div>');
      type('/zzzz');
      await settle();
      expect(page('.tx-editor__suggestions')).toBeNull();
    });

    it('inserts emoji after two letters', async () => {
      await start();
      type(':f');
      await settle();
      expect(page('.tx-editor__suggestions')).toBeNull();
      type('i');
      await settle();
      expect(page('.tx-editor__suggestions')?.getAttribute('aria-label')).toBe('Emoji');
      expect(options()[0].querySelector('.tx-editor__glyph')?.textContent).toBe('🔥');
      press('Enter');
      await settle();
      expect(editor().getText()).toBe('🔥');
    });

    it('turns off triggers and survives positions it cannot measure', async () => {
      await start((value) => {
        value.slashMenu.set(false);
        value.emoji.set(false);
        value.mentions.set(undefined);
      });
      unmeasurable();
      type('/ :fi @a');
      await settle();
      expect(page('.tx-editor__suggestions')).toBeNull();
      host.mentions.set(() => people);
      await settle();
      type(' @');
      await settle();
      expect(options()).toHaveLength(2);
    });
  });

  describe('AI actions', () => {
    const actions: TxEditorAiAction[] = [
      { id: 'fix', label: 'Fix grammar' },
      { id: 'short', label: 'Shorter', icon: 'minus' },
    ];
    const ask = async (label: string, text = 'Hello') => {
      select(text);
      await settle();
      bubble('Improve with AI')?.click();
      await settle();
      menuItem(label)?.click();
      await settle();
      return host.requests.at(-1) as TxEditorAiRequest;
    };
    const bubbleButton = (text: string) => Array.from(document.querySelectorAll<HTMLButtonElement>('.tx-editor__bubble button')).find((button) => button.textContent?.includes(text));

    beforeEach(async () => {
      await create((value) => value.aiActions.set(actions));
      await focus();
    });

    it('sends the selection and discards the answer on request', async () => {
      const request = await ask('Fix grammar');
      expect(request.action).toEqual(actions[0]);
      expect(request.text).toBe('Hello');
      expect(request.html).toBe('Hello');
      expect(page('.tx-editor__ai-pending')?.textContent).toBe('Hello');
      await request.replace('Hi there');
      await settle();
      expect(html()).toBe('<p>Hi there <strong>world</strong></p>');
      expect(page('.tx-editor__bubble-label')?.textContent).toContain('AI');
      bubbleButton('Undo')?.click();
      await settle();
      expect(html()).toBe('<p>Hello <strong>world</strong></p>');
      expect(aiKey.getState(view().state)).toBeNull();
      await request.replace('late');
      expect(html()).toBe('<p>Hello <strong>world</strong></p>');
    });

    it('streams an answer and keeps it', async () => {
      const request = await ask('Shorter');
      async function* chunks() {
        yield 'Yo ';
        yield 'there';
      }
      await request.replace(chunks());
      await settle();
      expect(html()).toBe('<p>Yo there <strong>world</strong></p>');
      bubbleButton('Keep')?.click();
      await settle();
      expect(aiKey.getState(view().state)).toBeNull();
      expect(html()).toBe('<p>Yo there <strong>world</strong></p>');
    });

    it('reads HTML answers into one or several blocks', async () => {
      const first = await ask('Fix grammar');
      await first.replace('<p><em>Hey</em></p>');
      await settle();
      expect(html()).toBe('<p><em>Hey</em> <strong>world</strong></p>');
      bubbleButton('Keep')?.click();
      await settle();
      const second = await ask('Fix grammar', 'Hey');
      unmeasurable();
      await second.replace('<p>One</p><p>Two</p>');
      await settle();
      expect(html()).toBe('<p>One</p><p>Two</p><p> <strong>world</strong></p>');
      expect(page('.tx-editor__ai-result')).not.toBeNull();
    });

    it('ignores the menu once the selection is gone', async () => {
      select('Hello');
      await settle();
      bubble('Improve with AI')?.click();
      await settle();
      cursor(1);
      menuItem('Fix grammar')?.click();
      await settle();
      expect(host.requests).toHaveLength(0);
    });
  });

  describe('images', () => {
    const png = (name = 'photo.png', size = 3) => new File(['x'.repeat(size)], name, { type: 'image/png' });
    const pick = (files: File[]) => {
      const picker = el<HTMLInputElement>('.tx-editor__file');
      Object.defineProperty(picker, 'files', { configurable: true, value: files });
      picker.dispatchEvent(new Event('change'));
    };
    const paste = (data: { files?: File[]; text?: string } | null) =>
      view().someProp('handlePaste', (handler) =>
        handler(view(), { clipboardData: data && { files: data.files ?? [], getData: () => data.text ?? '' } } as unknown as ClipboardEvent, Slice.empty),
      );
    const drop = (files: File[] | null) =>
      view().someProp('handleDrop', (handler) => handler(view(), { dataTransfer: files && { files }, clientX: 0, clientY: 0 } as unknown as DragEvent, Slice.empty, false));

    it('reads picked images and rejects other files', async () => {
      await create();
      cursor(textPos('world', 5));
      pick([png(), new File(['x'], 'notes.txt', { type: 'text/plain' })]);
      await vi.waitFor(() => expect(html()).toContain('<img src="data:image/png;base64,eHh4" alt="photo">'));
      expect(host.rejections).toEqual([expect.objectContaining({ reason: 'type', message: 'notes.txt' })]);
      expect(el<HTMLInputElement>('.tx-editor__file').value).toBe('');
    });

    it('rejects images over the size limit', async () => {
      await create((value) => value.maxImageSize.set(2048));
      pick([png('big.png', 4000)]);
      host.maxImageSize.set(2 * 1024 * 1024);
      await settle();
      pick([png('huge.png', 3 * 1024 * 1024)]);
      await settle();
      expect(host.rejections.map((rejection) => rejection.message)).toEqual(['big.png is larger than 2 KB', 'huge.png is larger than 2 MB']);
    });

    it('uploads images and skips failed uploads', async () => {
      const upload = vi.fn((file: File) => Promise.resolve(file.name === 'ok.png' ? 'https://cdn.example.com/ok.png' : ''));
      await create((value) => value.imageUpload.set(upload));
      pick([png('fail.png')]);
      await settle();
      expect(html()).not.toContain('<img');
      pick([png('ok.png')]);
      await vi.waitFor(() => expect(html()).toContain('<img src="https://cdn.example.com/ok.png" alt="ok">'));
    });

    it('pastes images, links over a selection and leaves other text to the editor', async () => {
      await create((value) => value.imageUpload.set(() => Promise.resolve('https://cdn.example.com/p.png')));
      expect(paste({ files: [png()] })).toBe(true);
      await vi.waitFor(() => expect(html()).toContain('https://cdn.example.com/p.png'));
      expect(paste({ text: 'https://example.com' })).toBeFalsy();
      select('Hello');
      expect(paste({ text: 'plain words' })).toBeFalsy();
      expect(paste(null)).toBeFalsy();
      expect(paste({ text: ' www.example.com ' })).toBe(true);
      expect(html()).toContain('<a href="https://www.example.com" target="_blank" rel="noopener noreferrer nofollow">Hello</a>');
      expect(view().someProp('transformPastedHTML', (handler) => handler('<p class="ql-align-center">x</p>', view()))).toBe('<p style="text-align: center;">x</p>');
    });

    it('keeps pasted links out of code and uses the own tab when asked', async () => {
      await create((value) => {
        value.html.set('<pre><code>code</code></pre><p>text</p>');
        value.linkTarget.set('_self');
      });
      view().dispatch(view().state.tr.setSelection(TextSelection.create(view().state.doc, 1, 3)));
      expect(paste({ text: 'https://example.com' })).toBeFalsy();
      select('text');
      expect(paste({ text: 'mailto:a@b.co' })).toBe(true);
      expect(html()).toContain('<a href="mailto:a@b.co">text</a>');
    });

    it('drops images after the block under the pointer', async () => {
      await create((value) => {
        value.html.set('<p>One</p><p>Two</p>');
        value.imageUpload.set(() => Promise.resolve('https://cdn.example.com/d.png'));
      });
      view().posAtCoords = () => ({ pos: 2, inside: -1 });
      expect(drop([png()])).toBe(true);
      await vi.waitFor(() => expect(html()).toBe('<p>One</p><img src="https://cdn.example.com/d.png" alt="photo"><p>Two</p>'));
      view().posAtCoords = () => null;
      cursor(1);
      expect(drop([png()])).toBe(true);
      await vi.waitFor(() => expect(html().match(/<img/g)).toHaveLength(2));
      expect(drop([new File(['x'], 'a.txt', { type: 'text/plain' })])).toBeFalsy();
      expect(drop(null)).toBeFalsy();
    });

    it('drops at the document edge and refuses files while read-only', async () => {
      await create((value) => value.imageUpload.set(() => Promise.resolve('https://cdn.example.com/e.png')));
      view().posAtCoords = () => ({ pos: 0, inside: -1 });
      expect(drop([png()])).toBe(true);
      await vi.waitFor(() => expect(html()).toBe('<img src="https://cdn.example.com/e.png" alt="photo"><p>Hello <strong>world</strong></p>'));
      host.readonly.set(true);
      await settle();
      expect(paste({ files: [png()] })).toBeFalsy();
    });
  });

  describe('drafts', () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
      localStorage.clear();
    });

    it('restores a saved draft into an empty editor and saves changes later', async () => {
      localStorage.setItem('draft-1', '<p>Saved</p>');
      await create((value) => {
        value.html.set('');
        value.draftKey.set('draft-1');
      });
      expect(html()).toBe('<p>Saved</p>');
      expect(host.html()).toBe('<p>Saved</p>');
      expect(host.drafts).toEqual(['<p>Saved</p>']);
      vi.useFakeTimers();
      cursor(6);
      type('!');
      vi.advanceTimersByTime(400);
      expect(localStorage.getItem('draft-1')).toBe('<p>Saved!</p>');
      editor().clear();
      vi.advanceTimersByTime(400);
      expect(localStorage.getItem('draft-1')).toBeNull();
      type('x');
      editor().clearDraft();
      vi.advanceTimersByTime(400);
      expect(localStorage.getItem('draft-1')).toBeNull();
    });

    it('keeps a bound value over a draft and works without storage', async () => {
      localStorage.setItem('draft-2', '<p>Old</p>');
      await create((value) => value.draftKey.set('draft-2'));
      expect(html()).toBe('<p>Hello <strong>world</strong></p>');
      expect(host.drafts).toEqual([]);
      editor().clearDraft();
      expect(localStorage.getItem('draft-2')).toBeNull();
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      vi.useFakeTimers();
      cursor(1);
      type('a');
      expect(() => vi.advanceTimersByTime(400)).not.toThrow();
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(() => editor().clearDraft()).not.toThrow();
    });

    it('starts empty when storage is blocked', async () => {
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new Error('blocked');
      });
      await create((value) => {
        value.html.set('');
        value.draftKey.set('draft-3');
      });
      expect(html()).toBe('');
      editor().clearDraft();
    });
  });

  describe('full view', () => {
    it('moves the frame into the dialog and back each time', async () => {
      await create((value) => {
        value.height.set('120px');
        value.maxHeight.set('300px');
      });
      const toggle = () => el<HTMLButtonElement>('.tx-editor__toolbar-end [data-tool]');
      for (let round = 0; round < 2; round++) {
        toggle().click();
        await settle();
        const frame = document.querySelector('.tx-editor__full-host > .tx-editor__frame') as HTMLElement;
        expect(frame).not.toBeNull();
        expect((frame.querySelector('.tx-editor__content') as HTMLElement).style.height).toBe('');
        (document.querySelector('.tx-editor__full-host [data-tool][aria-pressed="true"]') as HTMLButtonElement).click();
        await settle();
        await new Promise((resolve) => setTimeout(resolve, 50));
        await settle();
        expect(el('tx-editor > .tx-editor__frame')).not.toBeNull();
        expect(el<HTMLElement>('.tx-editor__content').style.height).toBe('120px');
      }
    });
  });

  describe('details', () => {
    it('writes shortcuts for Mac and other systems', () => {
      expect(shortcutLabel('Mod+Shift+Alt+K', true)).toBe('⌘⇧⌥K');
      expect(shortcutLabel('Mod+Shift+Alt+K', false)).toBe('Ctrl+Shift+Alt+K');
    });

    it('keeps a toolbar with only the end slot and ignores arrows there', async () => {
      await create((value) => {
        value.toolbar.set('none');
        value.fullViewButton.set(false);
        value.end.set(true);
      });
      const toolbar = el('[role="toolbar"]');
      expect(toolbar.querySelector('.own-end')?.textContent).toBe('Saved');
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      toolbar.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it('keeps the focus in the text when a tool is pressed', async () => {
      await create();
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      tool('bold').dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('ignores menu commands once editing is off', async () => {
      await create();
      cursor(1);
      tool('blockStyle').click();
      await settle();
      host.readonly.set(true);
      await settle();
      menuItem('Heading 2')?.click();
      await settle();
      expect(html()).toBe('<p>Hello <strong>world</strong></p>');
    });

    it('links typed addresses in the own tab and uses the default quotes', async () => {
      await create((value) => {
        value.html.set('');
        value.linkTarget.set('_self');
      });
      cursor(1);
      type('"go" a.com ');
      expect(html()).toBe('<p>“go” <a href="https://a.com">a.com</a> </p>');
    });

    it('labels task checkboxes and names custom colours by their label', async () => {
      await create((value) => value.html.set('<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><div><p>Task</p></div></li></ul>'));
      expect(el('[role="textbox"] li input')?.getAttribute('aria-label')).toBe('Checklist');
      cursor(3);
      tool('textColor').click();
      await settle();
      expect(Array.from(document.querySelectorAll('.tx-editor__swatch[data-kind="textColor"]')).map((swatch) => swatch.getAttribute('aria-label'))).toEqual(['Red', 'Brand']);
    });

    it('sizes the selection anchor to one line for selections over several lines', async () => {
      await create((value) => value.html.set('<p>One</p><p>Two</p>'));
      await focus();
      const measure = view().coordsAtPos.bind(view());
      view().coordsAtPos = (pos: number, side?: number) => (side === undefined ? { left: pos, right: pos + 1, top: pos * 10, bottom: pos * 10 + 8 } : measure(pos, side));
      view().dispatch(view().state.tr.setSelection(TextSelection.create(view().state.doc, 1, 8)));
      await settle();
      const anchor = el<HTMLElement>('.tx-editor__anchor');
      expect(anchor.style.width).toBe('1px');
      expect(anchor.style.height).toBe('78px');
    });

    it('clears no draft without a key', async () => {
      await create();
      localStorage.setItem('other', 'x');
      editor().clearDraft();
      expect(localStorage.getItem('other')).toBe('x');
      localStorage.clear();
    });
  });

  describe('suggestion details', () => {
    it('keeps the list for unrelated updates and answers ArrowUp on an empty people list', async () => {
      const source = vi.fn((query: string) => (query ? [] : [{ id: '1', label: 'Ann' }]));
      await create((value) => {
        value.html.set('');
        value.mentions.set(source);
      });
      await focus();
      cursor(1);
      type('@');
      await settle();
      view().dispatch(view().state.tr.setMeta('unrelated', true));
      await settle();
      expect(source).toHaveBeenCalledTimes(1);
      type('x');
      await settle();
      expect(press('ArrowUp')).toBe(false);
    });

    it('stops writing a streamed answer once it is kept', async () => {
      await create((value) => value.aiActions.set([{ id: 'fix', label: 'Fix grammar' }]));
      await focus();
      select('Hello');
      await settle();
      bubble('Improve with AI')?.click();
      await settle();
      menuItem('Fix grammar')?.click();
      await settle();
      const request = host.requests[0];
      let release: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => (release = resolve));
      async function* chunks() {
        yield 'Hey';
        await gate;
        yield ' you';
      }
      const done = request.replace(chunks());
      await settle();
      expect(html()).toBe('<p>Hey <strong>world</strong></p>');
      view().dispatch(view().state.tr.setMeta(aiKey, null));
      release();
      await done;
      expect(html()).toBe('<p>Hey <strong>world</strong></p>');
    });
  });

  describe('after destroy', () => {
    it('does nothing once the view is gone', async () => {
      await create();
      const instance = editor();
      fixture.destroy();
      expect(instance.editorView).toBeNull();
      expect(instance.getText()).toBe('');
      expect(() => {
        instance.insertHtml('<p>x</p>');
        instance.clear();
        instance.focus();
      }).not.toThrow();
      await new Promise((resolve) => setTimeout(resolve));
    });
  });
});
