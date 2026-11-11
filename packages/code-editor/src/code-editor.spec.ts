import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxCodeDiff } from './code-diff.component';
import { TxCodeEditor } from './code-editor.component';
import { TxCodeDiffSummary } from './code-editor.types';

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
