import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorView } from '@codemirror/view';
import { TxCodeDiff } from './code-diff.component';
import { TxCodeDiffSummary, TxCodeDiffView } from './code-editor.types';

function stubLayout(): void {
  const rect = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) } as DOMRect;
  const list = Object.assign([rect], { item: () => rect }) as unknown as DOMRectList;
  Range.prototype.getClientRects ??= () => list;
  Range.prototype.getBoundingClientRect ??= () => rect;
}

function scrollable(element: HTMLElement): { top: number; left: number } {
  const position = { top: 0, left: 0 };
  Object.defineProperty(element, 'scrollTop', { configurable: true, get: () => position.top, set: (value: number) => (position.top = value) });
  Object.defineProperty(element, 'scrollLeft', { configurable: true, get: () => position.left, set: (value: number) => (position.left = value) });
  return position;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function press(view: EditorView, key: string, init: KeyboardEventInit = {}): void {
  view.contentDOM.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
}

@Component({
  imports: [TxCodeDiff],
  template: `
    <tx-code-diff
      [original]="original()"
      [(value)]="value"
      [language]="language()"
      [view]="view()"
      [readOnly]="readOnly()"
      [indentGuides]="guides()"
      [ignoreTrimWhitespace]="ignoreTrim()"
      [scrollToFirstChange]="scrollFirst()"
      [height]="height()"
      [ariaLabel]="label()"
      (changed)="summary.set($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly original = signal<string | null>('a\nb\nc');
  readonly value = signal<string | null>('a\nB\nc\nd');
  readonly language = signal('javascript');
  readonly view = signal<TxCodeDiffView>('split');
  readonly readOnly = signal(false);
  readonly guides = signal(true);
  readonly ignoreTrim = signal(true);
  readonly scrollFirst = signal(true);
  readonly height = signal<string | undefined>('300px');
  readonly label = signal<string | undefined>(undefined);
  readonly summary = signal<TxCodeDiffSummary | null>(null);
}

describe('TxCodeDiff in detail', () => {
  beforeEach(stubLayout);

  async function setup(configure: (host: Host) => void = () => undefined) {
    const fixture = TestBed.createComponent(Host);
    configure(fixture.componentInstance);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-code-diff') as HTMLElement;
    const diff = fixture.debugElement.children[0].componentInstance as TxCodeDiff;
    return { fixture, root, diff, host: fixture.componentInstance, editors: () => editors(root) };
  }

  function editors(root: HTMLElement): EditorView[] {
    return [...root.querySelectorAll<HTMLElement>('.cm-editor')].map((element) => EditorView.findFromDOM(element) as EditorView);
  }

  async function settle(fixture: ComponentFixture<Host>): Promise<void> {
    await wait(200);
    await fixture.whenStable();
  }

  it('shows the original and the modified text side by side', async () => {
    const { root, host, editors } = await setup();
    const [original, modified] = editors();
    expect(root.classList).toContain('tx-code-diff--split');
    expect(root.style.height).toBe('300px');
    expect(original.contentDOM.getAttribute('aria-label')).toBe('Original');
    expect(original.contentDOM.getAttribute('aria-readonly')).toBe('true');
    expect(modified.contentDOM.getAttribute('aria-label')).toBe('Modified');
    expect(modified.contentDOM.hasAttribute('aria-readonly')).toBe(false);
    expect(original.dom.querySelectorAll('.cm-line.tx-code-diff__line--removed')).toHaveLength(1);
    expect(original.dom.querySelector('.tx-code-diff__filler')).not.toBeNull();
    expect(modified.dom.querySelectorAll('.cm-line.tx-code-diff__line--inserted')).toHaveLength(2);
    expect(host.summary()).toEqual({ added: 2, removed: 1, changes: 2 });
  });

  it('keeps the scroll positions of both sides together', async () => {
    const { editors } = await setup();
    const [original, modified] = editors();
    const left = scrollable(original.scrollDOM);
    const right = scrollable(modified.scrollDOM);
    left.top = 40;
    left.left = 5;
    original.scrollDOM.dispatchEvent(new Event('scroll'));
    expect(right).toEqual({ top: 40, left: 5 });
    modified.scrollDOM.dispatchEvent(new Event('scroll'));
    right.top = 41;
    modified.scrollDOM.dispatchEvent(new Event('scroll'));
    expect(left.top).toBe(40);
    right.top = 90;
    modified.scrollDOM.dispatchEvent(new Event('scroll'));
    expect(left.top).toBe(90);
  });

  it('follows text changes of both sides from outside', async () => {
    const { fixture, host, editors } = await setup();
    host.original.set('a\nB\nc\nd');
    await fixture.whenStable();
    expect(editors()[0].state.doc.toString()).toBe('a\nB\nc\nd');
    expect(host.summary()).toEqual({ added: 0, removed: 0, changes: 0 });
    host.value.set('z');
    await fixture.whenStable();
    expect(editors()[1].state.doc.toString()).toBe('z');
    expect(host.summary()?.changes).toBe(1);
    host.original.set(null);
    host.value.set(null);
    await fixture.whenStable();
    expect(editors()[0].state.doc.toString()).toBe('');
    expect(editors()[1].state.doc.toString()).toBe('');
    expect(host.summary()).toEqual({ added: 0, removed: 0, changes: 0 });
  });

  it('reports edits at once and recomputes the changes after a pause', async () => {
    const { fixture, host, editors } = await setup((value) => value.view.set('inline'));
    const [modified] = editors();
    modified.dispatch({ changes: { from: 0, insert: 'x' }, userEvent: 'input.type' });
    modified.dispatch({ changes: { from: 1, insert: 'y' }, userEvent: 'input.type' });
    await fixture.whenStable();
    expect(host.value()).toBe('xya\nB\nc\nd');
    expect(host.summary()).toEqual({ added: 2, removed: 1, changes: 2 });
    await settle(fixture);
    expect(host.summary()).toEqual({ added: 3, removed: 2, changes: 2 });
    expect(modified.dom.querySelectorAll('.cm-line.tx-code-diff__line--inserted')).toHaveLength(3);
  });

  it('jumps between changes with F7 and Shift+F7 and wraps around', async () => {
    const { diff, editors } = await setup((value) => value.view.set('inline'));
    const [modified] = editors();
    const line = () => modified.state.doc.lineAt(modified.state.selection.main.head).number;
    expect(diff.nextChange()).toBe(true);
    expect(line()).toBe(2);
    press(modified, 'F7');
    expect(line()).toBe(4);
    press(modified, 'F7');
    expect(line()).toBe(2);
    press(modified, 'F7', { shiftKey: true });
    expect(line()).toBe(4);
    expect(diff.previousChange()).toBe(true);
    expect(line()).toBe(2);
  });

  it('has nowhere to jump without changes or views', async () => {
    const { fixture, diff, host } = await setup((value) => value.value.set('a\nb\nc'));
    expect(diff.nextChange()).toBe(false);
    host.value.set('a\nb');
    await fixture.whenStable();
    fixture.destroy();
    expect(diff.previousChange()).toBe(false);
  });

  it('lets Tab leave the editor after Escape', async () => {
    const { fixture, host, editors } = await setup((value) => value.view.set('inline'));
    const [modified] = editors();
    press(modified, 'Escape');
    press(modified, 'Shift');
    press(modified, 'Tab');
    expect(modified.state.doc.toString()).toBe('a\nB\nc\nd');
    press(modified, 'a');
    press(modified, 'Tab');
    await fixture.whenStable();
    expect(host.value()).toBe('    a\nB\nc\nd');
  });

  it('rebuilds the editors when the layout changes', async () => {
    const { fixture, root, host, editors } = await setup();
    expect(editors()).toHaveLength(2);
    host.view.set('inline');
    await fixture.whenStable();
    expect(editors()).toHaveLength(1);
    expect(root.querySelector('.tx-code-diff__removed')?.textContent).toBe('b');
    expect(root.classList).toContain('tx-code-diff--wrap');
    host.readOnly.set(true);
    host.label.set('Review');
    await fixture.whenStable();
    expect(editors()[0].contentDOM.getAttribute('aria-readonly')).toBe('true');
    expect(editors()[0].contentDOM.getAttribute('aria-label')).toBe('Review');
    expect(root.getAttribute('aria-label')).toBe('Review');
  });

  it('draws plain text for unknown languages without guides, height or trimming', async () => {
    const { root, host } = await setup((value) => {
      value.language.set('cobol');
      value.guides.set(false);
      value.height.set(undefined);
      value.ignoreTrim.set(false);
      value.scrollFirst.set(false);
      value.original.set('  a\nb');
      value.value.set('  a  \nb');
    });
    expect(root.style.height).toBe('');
    expect(root.querySelector('.tx-code-tok-keyword')).toBeNull();
    expect(root.querySelector('.tx-code-guides')).toBeNull();
    expect(host.summary()).toEqual({ added: 1, removed: 1, changes: 1 });
  });

  it('starts both sides empty without texts', async () => {
    const { editors, host } = await setup((value) => {
      value.original.set(null);
      value.value.set(null);
    });
    expect(editors().map((view) => view.state.doc.toString())).toEqual(['', '']);
    expect(host.summary()).toEqual({ added: 0, removed: 0, changes: 0 });
  });

  it('scrolls the first change to the middle once the editor is measured', async () => {
    const native = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop') as PropertyDescriptor;
    const positions = new WeakMap<Element, number>();
    Object.defineProperty(Element.prototype, 'scrollTop', {
      configurable: true,
      get(this: Element) {
        return positions.get(this) ?? 0;
      },
      set(this: Element, value: number) {
        positions.set(this, value);
      },
    });
    try {
      const { editors } = await setup((value) => {
        value.view.set('inline');
        value.original.set(Array.from({ length: 60 }, (_, index) => `line ${index}`).join('\n'));
        value.value.set(Array.from({ length: 60 }, (_, index) => (index === 50 ? 'changed' : `line ${index}`)).join('\n'));
      });
      await wait(50);
      expect(editors()[0].scrollDOM.scrollTop).toBeGreaterThan(0);
    } finally {
      Object.defineProperty(Element.prototype, 'scrollTop', native);
    }
  });
});
