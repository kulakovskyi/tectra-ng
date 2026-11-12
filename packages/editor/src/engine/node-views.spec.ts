import { Slice } from 'prosemirror-model';
import { EditorState, NodeSelection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { dropCursor } from './drop-cursor';
import { parseHtml, serializeHtml } from './html';
import { TxCalloutView, TxImageView, TxTaskItemView, TxVideoView } from './node-views';
import { txEditorSchema as schema } from './schema';

const rect = (left: number, top: number, width: number, height: number) => () =>
  ({ x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON: () => ({}) }) as DOMRect;

function mount(html: string, plugins = [dropCursor()]): EditorView {
  const state = EditorState.create({ schema, doc: parseHtml(html, document), plugins });
  const place = document.createElement('div');
  document.body.appendChild(place);
  return new EditorView(place, {
    state,
    nodeViews: {
      task_item: (node, view, getPos) => new TxTaskItemView(node, view, getPos, () => 'Task'),
      video: (node, view, getPos) => new TxVideoView(node, view, getPos),
      callout: (node, view, getPos) => new TxCalloutView(node, view, getPos, () => 'Tone'),
      image: (node, view, getPos) => new TxImageView(node, view, getPos),
    },
  });
}

const html = (view: EditorView) => serializeHtml(view.state.doc, document).replace(/;"/g, '"');
const pointer = (target: EventTarget, type: string, init: MouseEventInit = {}) => target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
const other = () => schema.nodes['paragraph'].create();
const elementFromPoint = document.elementFromPoint;

beforeAll(() => {
  document.elementFromPoint = () => null;
});

afterAll(() => {
  document.elementFromPoint = elementFromPoint;
});

describe('node views', () => {
  let view: EditorView;

  afterEach(() => {
    view.destroy();
    document.body.innerHTML = '';
  });

  it('checks task items with a labelled checkbox', () => {
    view = mount('<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><div><p>Task</p></div></li></ul>');
    const item = view.dom.querySelector('li') as HTMLLIElement;
    const checkbox = item.querySelector('input') as HTMLInputElement;
    expect(checkbox.getAttribute('aria-label')).toBe('Task');
    expect(item.getAttribute('data-checked')).toBe('false');
    expect(pointer(checkbox, 'mousedown')).toBe(false);
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(html(view)).toContain('data-checked="true"');
    expect(view.dom.querySelector('li')?.getAttribute('data-checked')).toBe('true');
    view.setProps({ editable: () => false });
    const current = view.dom.querySelector('li input') as HTMLInputElement;
    current.checked = false;
    current.dispatchEvent(new Event('change'));
    expect(current.checked).toBe(true);
    expect(html(view)).toContain('data-checked="true"');
  });

  it('answers ProseMirror about task item events, mutations and updates', () => {
    view = mount('<p>x</p>');
    const node = schema.nodes['task_item'].create({ checked: true }, schema.nodes['paragraph'].create());
    const task = new TxTaskItemView(node, view, () => undefined, () => 'Task');
    const checkbox = task.dom.querySelector('input') as HTMLInputElement;
    expect(task.stopEvent({ target: checkbox } as unknown as Event)).toBe(true);
    expect(task.stopEvent({ target: task.contentDOM } as unknown as Event)).toBe(false);
    expect(task.ignoreMutation({ type: 'selection', target: checkbox })).toBe(true);
    expect(task.ignoreMutation({ type: 'selection', target: task.contentDOM })).toBe(false);
    expect(task.update(other())).toBe(false);
    expect(task.update(node.type.create({ checked: false }, node.content))).toBe(true);
    expect(checkbox.checked).toBe(false);
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(checkbox.checked).toBe(false);
  });

  it('selects a video through its shield', () => {
    view = mount('<p>x</p><iframe src="https://vimeo.com/76979871"></iframe>');
    const video = view.dom.querySelector('.tx-editor__video') as HTMLElement;
    expect(video.querySelector('iframe')?.getAttribute('src')).toBe('https://player.vimeo.com/video/76979871');
    expect(pointer(video.querySelector('.tx-editor__video-shield') as HTMLElement, 'mousedown')).toBe(false);
    expect(view.state.selection).toBeInstanceOf(NodeSelection);
    expect(video.classList).toContain('tx-editor__video--selected');
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 1)));
    expect(video.classList).not.toContain('tx-editor__video--selected');
    const loose = new TxVideoView(view.state.doc.child(1), view, () => undefined);
    pointer(loose.dom.querySelector('.tx-editor__video-shield') as HTMLElement, 'mousedown');
    expect(view.state.selection).toBeInstanceOf(TextSelection);
    expect(loose.stopEvent()).toBe(false);
    expect(loose.ignoreMutation()).toBe(true);
  });

  it('cycles the callout tone from its marker', () => {
    view = mount('<div data-type="callout" data-tone="danger"><p>Note</p></div>');
    const marker = () => view.dom.querySelector('.tx-editor__callout-marker') as HTMLButtonElement;
    expect(marker().getAttribute('aria-label')).toBe('Tone');
    expect(marker().title).toBe('Tone');
    expect(pointer(marker(), 'mousedown')).toBe(false);
    marker().click();
    expect(view.dom.querySelector('[data-type="callout"]')?.getAttribute('data-tone')).toBe('info');
    marker().click();
    expect(html(view)).toBe('<div data-type="callout" data-tone="success"><p>Note</p></div>');
    view.setProps({ editable: () => false });
    marker().click();
    expect(html(view)).toBe('<div data-type="callout" data-tone="success"><p>Note</p></div>');
  });

  it('answers ProseMirror about callout events, mutations and updates', () => {
    view = mount('<p>x</p>');
    const node = schema.nodes['callout'].create({ tone: 'warn' }, schema.nodes['paragraph'].create());
    const callout = new TxCalloutView(node, view, () => undefined, () => 'Tone');
    const marker = callout.dom.querySelector('button') as HTMLButtonElement;
    expect(callout.stopEvent({ target: marker } as unknown as Event)).toBe(true);
    expect(callout.ignoreMutation({ type: 'selection', target: marker })).toBe(true);
    expect(callout.ignoreMutation({ type: 'selection', target: callout.contentDOM })).toBe(false);
    expect(callout.update(other())).toBe(false);
    expect(callout.update(node.type.create({ tone: 'info' }, node.content))).toBe(true);
    expect(callout.dom.getAttribute('data-tone')).toBe('info');
    marker.click();
    expect(callout.dom.getAttribute('data-tone')).toBe('info');
  });

  it('renders images and resizes them from both handles', () => {
    view = mount('<img src="https://a.com/x.png" alt="X" title="T" width="100">');
    Object.defineProperty(view.dom, 'clientWidth', { value: 400 });
    const frame = view.dom.querySelector('.tx-editor__image') as HTMLElement;
    const image = frame.querySelector('img') as HTMLImageElement;
    image.getBoundingClientRect = rect(0, 0, 100, 50);
    expect(image.alt).toBe('X');
    expect(image.title).toBe('T');
    expect(image.style.width).toBe('100px');
    const [left, right] = Array.from(frame.querySelectorAll<HTMLElement>('.tx-editor__image-handle'));
    const capture = vi.fn();
    right.setPointerCapture = capture;
    expect(pointer(right, 'pointerdown', { clientX: 100 })).toBe(false);
    expect(capture).toHaveBeenCalled();
    expect(frame.classList).toContain('tx-editor__image--resizing');
    pointer(right, 'pointermove', { clientX: 1000 });
    expect(image.style.width).toBe('400px');
    pointer(right, 'pointermove', { clientX: 150 });
    pointer(right, 'pointerup');
    expect(frame.classList).not.toContain('tx-editor__image--resizing');
    expect(html(view)).toBe('<img src="https://a.com/x.png" alt="X" title="T" width="150">');
    const current = () => view.dom.querySelector('.tx-editor__image img') as HTMLImageElement;
    current().getBoundingClientRect = rect(0, 0, 150, 50);
    pointer(left, 'pointerdown', { clientX: 0 });
    pointer(left, 'pointermove', { clientX: 200 });
    pointer(left, 'pointercancel');
    expect(html(view)).toBe('<img src="https://a.com/x.png" alt="X" title="T" width="48">');
  });

  it('skips resizing for other buttons, unchanged widths and read-only views', () => {
    view = mount('<img src="https://a.com/x.png">');
    const frame = view.dom.querySelector('.tx-editor__image') as HTMLElement;
    const image = frame.querySelector('img') as HTMLImageElement;
    expect(image.alt).toBe('');
    expect(image.hasAttribute('title')).toBe(false);
    expect(image.style.width).toBe('');
    image.getBoundingClientRect = rect(0, 0, 100, 50);
    const right = frame.querySelector('[data-side="right"]') as HTMLElement;
    const dispatch = vi.spyOn(view, 'dispatch');
    expect(pointer(right, 'pointerdown', { clientX: 100, button: 2 })).toBe(true);
    pointer(right, 'pointerdown', { clientX: 100 });
    pointer(right, 'pointerup');
    expect(dispatch).not.toHaveBeenCalled();
    view.setProps({ editable: () => false });
    expect(pointer(right, 'pointerdown', { clientX: 100 })).toBe(true);
  });

  it('answers ProseMirror about image events, mutations, selection and updates', () => {
    view = mount('<p>x</p>');
    const node = schema.nodes['image'].create({ src: 'https://a.com/x.png', title: 'T' });
    const loose = new TxImageView(node, view, () => undefined);
    const handle = loose.dom.querySelector('.tx-editor__image-handle') as HTMLElement;
    expect(loose.stopEvent({ target: handle } as unknown as Event)).toBe(true);
    expect(loose.stopEvent({ target: loose.dom } as unknown as Event)).toBe(false);
    expect(loose.ignoreMutation()).toBe(true);
    loose.selectNode();
    expect(loose.dom.classList).toContain('tx-editor__image--selected');
    loose.deselectNode();
    expect(loose.dom.classList).not.toContain('tx-editor__image--selected');
    expect(loose.update(other())).toBe(false);
    expect(loose.update(node.type.create({ src: 'https://a.com/y.png', width: '20' }))).toBe(true);
    expect(loose.dom.querySelector('img')?.hasAttribute('title')).toBe(false);
    const image = loose.dom.querySelector('img') as HTMLImageElement;
    image.getBoundingClientRect = rect(0, 0, 100, 50);
    const dispatch = vi.spyOn(view, 'dispatch');
    pointer(handle, 'pointerdown', { clientX: 0 });
    pointer(handle, 'pointermove', { clientX: -40 });
    pointer(handle, 'pointerup');
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe('drop cursor', () => {
  let view: EditorView;
  const drag = (type: string, init: MouseEventInit = {}) => view.dom.dispatchEvent(new MouseEvent(type, { bubbles: true, ...init }));
  const cursor = () => view.dom.parentElement?.querySelector('.tx-editor__drop-cursor') as HTMLElement | null;
  const aim = (pos: number | null) => (view.posAtCoords = () => (pos === null ? null : { pos, inside: -1 }));

  beforeEach(() => {
    view = mount('<p>one</p><p>two</p>');
    view.coordsAtPos = () => ({ left: 30, right: 30, top: 5, bottom: 25 });
    const place = view.dom.parentElement as HTMLElement;
    place.getBoundingClientRect = rect(0, 0, 200, 100);
    Object.defineProperty(view.dom, 'offsetParent', { configurable: true, value: place });
    Array.from(view.dom.children).forEach((child, index) => ((child as HTMLElement).getBoundingClientRect = rect(10, index * 40, 180, 30)));
  });

  afterEach(() => {
    view.destroy();
    document.body.innerHTML = '';
  });

  it('draws a bar between blocks and a caret inside text', () => {
    aim(5);
    drag('dragover');
    expect(cursor()?.style.cssText).toBe('left: 10px; top: 34px; width: 180px; height: 2px;');
    aim(0);
    drag('dragover');
    expect(cursor()?.style.top).toBe('-1px');
    aim(10);
    drag('dragover');
    expect(cursor()?.style.top).toBe('69px');
    aim(2);
    drag('dragover');
    expect(cursor()?.style.cssText).toBe('left: 29px; top: 5px; width: 2px; height: 20px;');
    drag('dragover');
    expect(view.dom.parentElement?.querySelectorAll('.tx-editor__drop-cursor')).toHaveLength(1);
  });

  it('measures from the offset parent and snaps to a drop point for dragged content', () => {
    (view.dom.parentElement as HTMLElement).getBoundingClientRect = rect(5, 5, 300, 300);
    view.dragging = { slice: new Slice(parseHtml('<p>z</p>', document).content, 0, 0), move: true };
    aim(2);
    drag('dragover');
    expect(cursor()?.style.left).toBe('5px');
    view.dragging = null;
  });

  it('hides when the drag ends, leaves or the document shrinks', () => {
    aim(5);
    drag('dragover');
    drag('dragleave', { relatedTarget: view.dom.firstChild });
    expect(cursor()).not.toBeNull();
    drag('dragleave');
    expect(cursor()).toBeNull();
    drag('dragover');
    drag('drop');
    expect(cursor()).toBeNull();
    drag('dragover');
    drag('dragend');
    expect(cursor()).toBeNull();
    aim(10);
    drag('dragover');
    view.dispatch(view.state.tr.delete(5, 10));
    expect(cursor()).toBeNull();
    view.dispatch(view.state.tr.insertText('!', 1));
    expect(cursor()).toBeNull();
  });

  it('falls back to the editor itself without an offset parent', () => {
    Object.defineProperty(view.dom, 'offsetParent', { configurable: true, value: null });
    view.dom.getBoundingClientRect = rect(0, 0, 200, 100);
    aim(2);
    drag('dragover');
    expect(view.dom.querySelector('.tx-editor__drop-cursor')?.getAttribute('style')).toBe('left: 29px; top: 5px; width: 2px; height: 20px;');
  });

  it('ignores drags it cannot place or while read-only', () => {
    aim(null);
    drag('dragover');
    expect(cursor()).toBeNull();
    aim(5);
    view.setProps({ editable: () => false });
    drag('dragover');
    expect(cursor()).toBeNull();
  });

  it('removes its bar when the view goes away', () => {
    aim(5);
    drag('dragover');
    const place = view.dom.parentElement as HTMLElement;
    view.destroy();
    expect(place.querySelector('.tx-editor__drop-cursor')).toBeNull();
    view = mount('<p>x</p>');
  });
});
