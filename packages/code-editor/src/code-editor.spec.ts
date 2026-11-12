import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorSelection } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { TxCodeDiff } from './code-diff.component';
import { TxCodeEditor } from './code-editor.component';
import { TxCodeDiffSummary } from './code-editor.types';
import { TxCodeEditorTokens } from './code-editor.component';

function stubLayout(): void {
  const rect = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) } as DOMRect;
  const list = Object.assign([rect], { item: () => rect }) as unknown as DOMRectList;
  Range.prototype.getClientRects ??= () => list;
  Range.prototype.getBoundingClientRect ??= () => rect;
}

@Component({
  imports: [TxCodeEditor, ReactiveFormsModule],
  template: `
    <tx-code-editor
      [formControl]="control"
      [language]="language()"
      [readOnly]="readOnly()"
      placeholder="Write code"
      height="200px"
      (codeChanged)="changes.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormHost {
  readonly control = new FormControl('{"a": 1}', Validators.required);
  readonly language = signal('json');
  readonly readOnly = signal(false);
  readonly changes: string[] = [];
}

@Component({
  imports: [TxCodeDiff],
  template: `<tx-code-diff [original]="original()" [(value)]="value" language="plain" height="200px" (changed)="summary.set($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DiffHost {
  readonly original = signal('a\nb\nc');
  readonly value = signal('a\nB\nc\nd');
  readonly summary = signal<TxCodeDiffSummary | null>(null);
}

@Component({
  imports: [TxCodeEditor],
  template: `<tx-code-editor diffMode originalValue="x\ny" [(value)]="value" language="plain" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DiffModeHost {
  readonly value = signal('x\nz');
}

describe('TxCodeEditor', () => {
  beforeEach(stubLayout);

  async function setup() {
    const fixture = TestBed.createComponent(FormHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-code-editor') as HTMLElement;
    const editor = fixture.debugElement.children[0].componentInstance as TxCodeEditor;
    return { fixture, root, editor, host: fixture.componentInstance };
  }

  it('starts the engine with the form value and the language colours', async () => {
    const { root } = await setup();
    expect(root.querySelector('.cm-editor')).not.toBeNull();
    expect(root.querySelector('.tx-code-editor__static')).toBeNull();
    expect(root.querySelector('.cm-content')?.textContent).toBe('{"a": 1}');
    expect(root.querySelector('.tx-code-tok-key')?.textContent).toBe('"a"');
    expect(root.style.height).toBe('200px');
    expect(root.getAttribute('data-language')).toBe('json');
    expect(root.querySelector('.cm-content')?.getAttribute('aria-label')).toBe('Code editor');
  });

  it('writes form values in and reports edits out', async () => {
    const { fixture, root, editor, host } = await setup();
    host.control.setValue('[1, 2]');
    await fixture.whenStable();
    expect(root.querySelector('.cm-content')?.textContent).toBe('[1, 2]');
    expect(editor.undo()).toBe(false);
    const view = (editor as unknown as { view: { dispatch(spec: object): void } }).view;
    view.dispatch({ changes: { from: 0, insert: 'x' }, userEvent: 'input.type' });
    await fixture.whenStable();
    expect(host.control.value).toBe('x[1, 2]');
    expect(host.changes).toEqual(['x[1, 2]']);
    expect(editor.value()).toBe('x[1, 2]');
    expect(editor.undo()).toBe(true);
    await fixture.whenStable();
    expect(host.control.value).toBe('[1, 2]');
  });

  it('draws indent guides on indented lines', async () => {
    const { fixture, root, host } = await setup();
    host.control.setValue('{\n  "a": {\n    "b": 1\n  }\n}');
    await fixture.whenStable();
    const guides = [...root.querySelectorAll<HTMLElement>('.cm-line.tx-code-guides')].map((line) => line.style.getPropertyValue('--tx-code-guides'));
    expect(guides).toEqual(['1', '2', '1']);
  });

  it('follows the control state', async () => {
    const { fixture, root, host } = await setup();
    host.control.setValue('');
    host.control.markAsTouched();
    await fixture.whenStable();
    expect(root.classList).toContain('tx-code-editor--invalid');
    expect(root.querySelector('.cm-placeholder')?.textContent).toBe('Write code');
    host.control.disable();
    await fixture.whenStable();
    expect(root.classList).toContain('tx-code-editor--disabled');
    expect(root.querySelector('.cm-content')?.getAttribute('contenteditable')).toBe('false');
  });

  it('opens search, counts matches and replaces them', async () => {
    const { fixture, root, editor, host } = await setup();
    host.control.setValue('red green red');
    await fixture.whenStable();
    editor.openSearch(true);
    await fixture.whenStable();
    const inputs = root.querySelectorAll<HTMLInputElement>('.tx-code-editor__search input');
    expect(inputs).toHaveLength(2);
    inputs[0].value = 'red';
    inputs[0].dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('.tx-code-editor__search-count')?.textContent).toBe('1 of 2');
    expect(root.querySelectorAll('.tx-code-editor__match')).toHaveLength(2);
    inputs[1].value = 'blue';
    inputs[1].dispatchEvent(new Event('input'));
    editor.replaceAll();
    await fixture.whenStable();
    expect(host.control.value).toBe('blue green blue');
    editor.closeSearch();
    await fixture.whenStable();
    expect(root.querySelector('.tx-code-editor__search')).toBeNull();
  });

  it('switches to the inline diff', async () => {
    stubLayout();
    const fixture = TestBed.createComponent(DiffModeHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('tx-code-diff')).not.toBeNull();
    expect(root.querySelector('.tx-code-diff__removed')?.textContent).toContain('y');
  });
});

describe('TxCodeDiff', () => {
  beforeEach(stubLayout);

  it('marks the changes and reports the counts', async () => {
    const fixture = TestBed.createComponent(DiffHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-code-diff') as HTMLElement;
    expect(fixture.componentInstance.summary()).toEqual({ added: 2, removed: 1, changes: 2 });
    expect(root.querySelectorAll('.cm-line.tx-code-diff__line--inserted')).toHaveLength(2);
    expect(root.querySelector('.tx-code-diff__removed')?.textContent).toBe('b');
    expect(root.getAttribute('aria-label')).toBe('Changes');
  });

  it('updates when the original changes', async () => {
    const fixture = TestBed.createComponent(DiffHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    fixture.componentInstance.original.set('a\nB\nc\nd');
    await fixture.whenStable();
    expect(fixture.componentInstance.summary()).toEqual({ added: 0, removed: 0, changes: 0 });
  });
});

@Component({
  imports: [TxCodeEditor],
  template: `
    <tx-code-editor
      [(value)]="value"
      [language]="language()"
      [readOnly]="readOnly()"
      [disabled]="disabled()"
      [search]="search()"
      [diffMode]="diffMode()"
      originalValue="red"
      [tabSize]="tabSize()"
      [ariaLabelledBy]="labelledBy()"
      [height]="height()"
      [dt]="dt()"
      (codeChanged)="changes.push($event)"
      (focused)="events.push('focus')"
      (blurred)="events.push('blur')"
      (diffChanged)="diffs.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EditorHost {
  readonly value = signal<string | null>('red green red');
  readonly language = signal('plain');
  readonly readOnly = signal(false);
  readonly disabled = signal<boolean | undefined>(undefined);
  readonly search = signal(true);
  readonly diffMode = signal(false);
  readonly tabSize = signal<number | undefined>(undefined);
  readonly labelledBy = signal<string | undefined>(undefined);
  readonly height = signal<string | undefined>('200px');
  readonly dt = signal<Partial<TxCodeEditorTokens> | undefined>(undefined);
  readonly changes: string[] = [];
  readonly events: string[] = [];
  readonly diffs: TxCodeDiffSummary[] = [];
}

describe('TxCodeEditor search and keys', () => {
  beforeEach(stubLayout);

  async function setup(configure: (host: EditorHost) => void = () => undefined) {
    const fixture = TestBed.createComponent(EditorHost);
    configure(fixture.componentInstance);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-code-editor') as HTMLElement;
    const editor = fixture.debugElement.children[0].componentInstance as TxCodeEditor;
    const view = () => EditorView.findFromDOM(root.querySelector('.cm-editor') as HTMLElement) as EditorView;
    const find = () => root.querySelector('.tx-code-editor__search input') as HTMLInputElement;
    const replace = () => root.querySelectorAll<HTMLInputElement>('.tx-code-editor__search input')[1];
    const count = () => root.querySelector('.tx-code-editor__search-count')?.textContent?.trim();
    const button = (label: string) => root.querySelector(`.tx-code-editor__search button[aria-label="${label}"]`) as HTMLButtonElement;
    return { fixture, root, editor, host: fixture.componentInstance, view, find, replace, count, button };
  }

  function press(target: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
  }

  function type(input: HTMLInputElement, text: string): void {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }

  it('opens search with the selected word and focuses the find field', async () => {
    const { fixture, root, view, find, replace, count } = await setup();
    view().dispatch({ selection: EditorSelection.range(4, 9) });
    expect(press(view().contentDOM, 'f', { ctrlKey: true }).defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(find().value).toBe('green');
    expect(count()).toBe('1 of 1');
    expect(root.ownerDocument.activeElement).toBe(find());
    expect(replace()).toBeUndefined();
    press(view().contentDOM, 'h', { ctrlKey: true });
    await fixture.whenStable();
    expect(root.ownerDocument.activeElement).toBe(replace());
  });

  it('opens search before the engine starts', async () => {
    const fixture = TestBed.createComponent(EditorHost);
    const editor = fixture.debugElement.children[0].componentInstance as TxCodeEditor;
    editor.openSearch();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-code-editor') as HTMLElement;
    expect(root.querySelector('.cm-editor')).not.toBeNull();
    expect(root.ownerDocument.activeElement).toBe(root.querySelector('.tx-code-editor__search input'));
  });

  it('keeps the query when the selection spans lines', async () => {
    const { fixture, editor, view, find } = await setup((host) => host.value.set('red\ngreen'));
    view().dispatch({ selection: EditorSelection.range(0, 6) });
    editor.openSearch();
    await fixture.whenStable();
    expect(find().value).toBe('');
  });

  it('steps through matches with Enter, F3, the editor keys and the buttons', async () => {
    const { fixture, editor, view, find, count, button } = await setup((value) => value.value.set('red green red red'));
    editor.openSearch();
    await fixture.whenStable();
    type(find(), 'red');
    await fixture.whenStable();
    expect(count()).toBe('1 of 3');
    const steps: [HTMLElement, string, KeyboardEventInit][] = [
      [find(), 'Enter', {}],
      [find(), 'Enter', {}],
      [find(), 'Enter', {}],
      [find(), 'Enter', { shiftKey: true }],
      [find(), 'F3', {}],
      [find(), 'F3', { shiftKey: true }],
      [view().contentDOM, 'F3', {}],
      [view().contentDOM, 'F3', { shiftKey: true }],
      [view().contentDOM, 'g', { ctrlKey: true }],
      [view().contentDOM, 'G', { ctrlKey: true, shiftKey: true, keyCode: 71 }],
    ];
    const seen: (string | undefined)[] = [];
    for (const [target, key, init] of steps) {
      press(target, key, init);
      await fixture.whenStable();
      seen.push(count());
    }
    expect(seen).toEqual(['2 of 3', '3 of 3', '1 of 3', '3 of 3', '1 of 3', '3 of 3', '1 of 3', '3 of 3', '1 of 3', '3 of 3']);
    expect(view().state.selection.main.from).toBe(14);
    button('Next match').click();
    await fixture.whenStable();
    expect(count()).toBe('1 of 3');
    button('Previous match').click();
    await fixture.whenStable();
    expect(count()).toBe('3 of 3');
    expect(press(find(), 'a').defaultPrevented).toBe(false);
  });

  it('closes search with Escape and leaves the editor keys alone while closed', async () => {
    const { fixture, root, editor, view, find } = await setup();
    const content = view().contentDOM;
    expect(press(content, 'F3').defaultPrevented).toBe(false);
    expect(press(content, 'F3', { shiftKey: true }).defaultPrevented).toBe(false);
    expect(press(content, 'g', { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(press(content, 'G', { ctrlKey: true, shiftKey: true, keyCode: 71 }).defaultPrevented).toBe(false);
    editor.openSearch();
    await fixture.whenStable();
    press(find(), 'Escape');
    await fixture.whenStable();
    expect(root.querySelector('.tx-code-editor__search')).toBeNull();
    expect(root.ownerDocument.activeElement).toBe(content);
    editor.closeSearch();
    editor.openSearch();
    await fixture.whenStable();
    press(content, 'Escape');
    await fixture.whenStable();
    expect(root.querySelector('.tx-code-editor__search')).toBeNull();
    expect(press(content, 'Escape').defaultPrevented).toBe(false);
  });

  it('refocuses the search fields with the search keys', async () => {
    const { fixture, root, editor, find, replace } = await setup();
    editor.openSearch();
    await fixture.whenStable();
    const refind = press(find(), 'F', { ctrlKey: true });
    expect(refind.defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(root.ownerDocument.activeElement).toBe(find());
    expect(press(find(), 'f', { ctrlKey: true, altKey: true }).defaultPrevented).toBe(false);
    press(find(), 'h', { ctrlKey: true });
    await fixture.whenStable();
    expect(root.ownerDocument.activeElement).toBe(replace());
    press(replace(), 'f', { ctrlKey: true });
    await fixture.whenStable();
    expect(root.ownerDocument.activeElement).toBe(find());
  });

  it('replaces one match at a time and all of them', async () => {
    const { fixture, host, editor, find, replace, count, button } = await setup((value) => value.value.set('red green red red'));
    editor.openSearch(true);
    await fixture.whenStable();
    type(find(), 'red');
    type(replace(), 'blue');
    await fixture.whenStable();
    press(replace(), 'Enter');
    await fixture.whenStable();
    expect(host.value()).toBe('blue green red red');
    expect(count()).toBe('1 of 2');
    button('Replace').click();
    await fixture.whenStable();
    expect(host.value()).toBe('blue green blue red');
    type(find(), 'blue');
    type(replace(), 'red');
    press(replace(), 'Enter', { metaKey: true });
    await fixture.whenStable();
    expect(host.value()).toBe('red green red red');
    type(find(), 'red');
    type(replace(), 'x');
    press(replace(), 'Enter', { ctrlKey: true });
    await fixture.whenStable();
    expect(host.value()).toBe('x green x x');
    expect(count()).toBe('No results');
    expect(button('Replace all').disabled).toBe(true);
    editor.replaceAll();
    editor.replaceCurrent();
    expect(host.value()).toBe('x green x x');
    type(find(), 'green');
    await fixture.whenStable();
    button('Replace all').click();
    await fixture.whenStable();
    expect(host.value()).toBe('x x x x');
  });

  it('searches with case, whole word and regular expression options', async () => {
    const { fixture, root, editor, host, find, replace, count, button } = await setup((value) => value.value.set('Red red reds'));
    editor.openSearch(true);
    await fixture.whenStable();
    type(find(), 'red');
    await fixture.whenStable();
    expect(count()).toBe('1 of 3');
    button('Match case').click();
    await fixture.whenStable();
    expect(button('Match case').getAttribute('aria-pressed')).toBe('true');
    expect(count()).toBe('1 of 2');
    button('Match whole word').click();
    await fixture.whenStable();
    expect(count()).toBe('1 of 1');
    button('Use regular expression').click();
    type(find(), '(r)ed');
    type(replace(), '$1ose');
    await fixture.whenStable();
    editor.replaceCurrent();
    await fixture.whenStable();
    expect(host.value()).toBe('Red rose reds');
    type(find(), '(');
    await fixture.whenStable();
    expect(find().classList).toContain('tx-input--invalid');
    type(find(), '');
    await fixture.whenStable();
    expect(count()).toBe('');
    expect(root.querySelectorAll('.tx-code-editor__match')).toHaveLength(0);
  });

  it('shows the replace row with its toggle and remembers it when search opens again', async () => {
    const { fixture, root, editor, replace } = await setup();
    editor.openSearch();
    await fixture.whenStable();
    const toggle = root.querySelector('.tx-code-editor__search-expand') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(replace()).toBeDefined();
    editor.openSearch();
    await fixture.whenStable();
    expect(replace()).toBeDefined();
    toggle.click();
    await fixture.whenStable();
    expect(replace()).toBeUndefined();
  });

  it('starts from the match after the cursor and wraps to the first one', async () => {
    const { fixture, editor, view, find, count } = await setup();
    editor.openSearch();
    await fixture.whenStable();
    type(find(), 'red');
    editor.closeSearch();
    view().dispatch({ selection: EditorSelection.cursor(5) });
    editor.openSearch();
    await fixture.whenStable();
    expect(count()).toBe('2 of 2');
    editor.closeSearch();
    view().dispatch({ selection: EditorSelection.cursor(13) });
    editor.openSearch();
    await fixture.whenStable();
    expect(count()).toBe('1 of 2');
    editor.findPrevious();
    await fixture.whenStable();
    expect(count()).toBe('2 of 2');
    type(find(), 'blue');
    editor.findNext();
    await fixture.whenStable();
    expect(count()).toBe('No results');
  });

  it('keeps search closed when it is off', async () => {
    const { fixture, root, editor, view } = await setup((host) => host.search.set(false));
    editor.openSearch();
    press(view().contentDOM, 'f', { ctrlKey: true });
    await fixture.whenStable();
    expect(root.querySelector('.tx-code-editor__search')).toBeNull();
  });

  it('refuses replacing in a read-only editor', async () => {
    const { fixture, host, editor, view, find, button } = await setup((value) => value.readOnly.set(true));
    expect(view().contentDOM.getAttribute('aria-readonly')).toBe('true');
    editor.openSearch(true);
    await fixture.whenStable();
    type(find(), 'red');
    await fixture.whenStable();
    expect(button('Replace').disabled).toBe(true);
    editor.replaceCurrent();
    editor.replaceAll();
    expect(host.value()).toBe('red green red');
  });

  it('lets Tab leave the editor after Escape and indents otherwise', async () => {
    const { fixture, host, view } = await setup((value) => {
      value.value.set('a');
      value.tabSize.set(2);
    });
    const content = view().contentDOM;
    view().dispatch({ selection: EditorSelection.cursor(0) });
    press(content, 'Escape');
    press(content, 'Shift');
    expect(press(content, 'Tab').defaultPrevented).toBe(false);
    press(content, 'x');
    press(content, 'Tab');
    await fixture.whenStable();
    expect(host.value()).toBe('  a');
    press(content, 'Tab', { shiftKey: true });
    await fixture.whenStable();
    expect(host.value()).toBe('a');
    host.value.set('    b');
    await fixture.whenStable();
    expect(view().state.tabSize).toBe(2);
  });

  it('reports focus and blur, and undoes and redoes edits', async () => {
    const { fixture, root, editor, host, view } = await setup();
    editor.focus();
    await fixture.whenStable();
    expect(host.events).toEqual(['focus']);
    view().contentDOM.dispatchEvent(new FocusEvent('blur'));
    expect(host.events).toEqual(['focus', 'blur']);
    view().dispatch({ changes: { from: 0, insert: 'x' }, userEvent: 'input.type' });
    await fixture.whenStable();
    expect(host.changes).toEqual(['xred green red']);
    expect(editor.undo()).toBe(true);
    expect(editor.redo()).toBe(true);
    await fixture.whenStable();
    expect(host.value()).toBe('xred green red');
    expect(root.querySelector('.cm-content')?.textContent).toBe('xred green red');
  });

  it('switches between the editor and the diff and keeps the value', async () => {
    const { fixture, root, editor, host } = await setup();
    host.diffMode.set(true);
    await fixture.whenStable();
    expect(root.classList).toContain('tx-code-editor--diff');
    expect(root.querySelector('tx-code-diff .cm-editor')).not.toBeNull();
    expect(root.querySelectorAll('.cm-editor')).toHaveLength(1);
    expect(editor.undo()).toBe(false);
    expect(editor.redo()).toBe(false);
    editor.focus();
    editor.openSearch();
    await fixture.whenStable();
    expect(root.querySelector('.tx-code-editor__search')).toBeNull();
    expect(host.diffs.at(-1)).toEqual({ added: 1, removed: 1, changes: 1 });
    const diffView = EditorView.findFromDOM(root.querySelector('tx-code-diff .cm-editor') as HTMLElement) as EditorView;
    diffView.dispatch({ changes: { from: 0, insert: 'x' }, userEvent: 'input.type' });
    await fixture.whenStable();
    expect(host.value()).toBe('xred green red');
    expect(host.changes).toEqual(['xred green red']);
    host.diffMode.set(false);
    await fixture.whenStable();
    expect(root.querySelector('tx-code-diff')).toBeNull();
    expect(root.querySelector('.cm-content')?.textContent).toBe('xred green red');
  });

  it('describes itself through the label, disabled state and styles', async () => {
    const { fixture, root, editor, host, view } = await setup((value) => {
      value.labelledBy.set('title');
      value.language.set('cobol');
      value.height.set(undefined);
      value.dt.set({ syntax: { keyword: 'red' } } as Partial<TxCodeEditorTokens>);
    });
    const content = view().contentDOM;
    expect(content.getAttribute('aria-labelledby')).toBe('title');
    expect(content.hasAttribute('aria-label')).toBe(false);
    expect(root.getAttribute('data-language')).toBe('plain');
    expect(root.style.height).toBe('');
    expect(root.style.getPropertyValue('--tx-code-syntax-keyword')).toBe('red');
    host.disabled.set(true);
    await fixture.whenStable();
    expect(content.getAttribute('aria-disabled')).toBe('true');
    expect(content.hasAttribute('tabindex')).toBe(false);
    editor.writeValue(null);
    await fixture.whenStable();
    expect(host.value()).toBe('');
  });

  it('starts empty without a value', async () => {
    const { root, view } = await setup((value) => value.value.set(null));
    expect(view().state.doc.toString()).toBe('');
    expect(root.querySelector('.tx-code-editor__static')).toBeNull();
  });
});
