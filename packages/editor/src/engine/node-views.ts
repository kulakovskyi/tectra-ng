import { Node as ProseNode } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';

export class TxTaskItemView implements NodeView {
  readonly dom: HTMLLIElement;
  readonly contentDOM: HTMLDivElement;
  private readonly checkbox: HTMLInputElement;

  constructor(
    private node: ProseNode,
    private view: EditorView,
    private getPos: () => number | undefined,
    label: () => string,
  ) {
    const document = view.dom.ownerDocument;
    this.dom = document.createElement('li');
    this.dom.setAttribute('data-type', 'taskItem');
    const wrapper = document.createElement('label');
    wrapper.contentEditable = 'false';
    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    this.checkbox.setAttribute('aria-label', label());
    this.checkbox.addEventListener('mousedown', (event) => event.preventDefault());
    this.checkbox.addEventListener('change', () => this.toggle());
    wrapper.append(this.checkbox, document.createElement('span'));
    this.contentDOM = document.createElement('div');
    this.dom.append(wrapper, this.contentDOM);
    this.render();
  }

  update(node: ProseNode): boolean {
    if (node.type !== this.node.type) {
      return false;
    }
    this.node = node;
    this.render();
    return true;
  }

  stopEvent(event: Event): boolean {
    return event.target === this.checkbox;
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Node }): boolean {
    return !this.contentDOM.contains(mutation.target);
  }

  private render(): void {
    const checked = !!this.node.attrs['checked'];
    this.checkbox.checked = checked;
    this.checkbox.disabled = !this.view.editable;
    this.dom.setAttribute('data-checked', String(checked));
  }

  private toggle(): void {
    const pos = this.getPos();
    if (pos === undefined || !this.view.editable) {
      this.render();
      return;
    }
    this.view.dispatch(this.view.state.tr.setNodeMarkup(pos, undefined, { ...this.node.attrs, checked: this.checkbox.checked }));
  }
}

export class TxVideoView implements NodeView {
  readonly dom: HTMLDivElement;

  constructor(node: ProseNode, view: EditorView, getPos: () => number | undefined) {
    const document = view.dom.ownerDocument;
    this.dom = document.createElement('div');
    this.dom.className = 'tx-editor__video';
    const frame = document.createElement('iframe');
    frame.src = String(node.attrs['src']);
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('allowfullscreen', 'true');
    frame.setAttribute('allow', 'encrypted-media; picture-in-picture; fullscreen');
    frame.setAttribute('loading', 'lazy');
    const shield = document.createElement('div');
    shield.className = 'tx-editor__video-shield';
    shield.addEventListener('mousedown', (event) => {
      event.preventDefault();
      const pos = getPos();
      if (pos !== undefined) {
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
        view.focus();
      }
    });
    this.dom.append(frame, shield);
  }

  selectNode(): void {
    this.dom.classList.add('tx-editor__video--selected');
  }

  deselectNode(): void {
    this.dom.classList.remove('tx-editor__video--selected');
  }

  stopEvent(): boolean {
    return false;
  }

  ignoreMutation(): boolean {
    return true;
  }
}

const MIN_IMAGE_WIDTH = 48;

export class TxImageView implements NodeView {
  readonly dom: HTMLDivElement;
  private readonly image: HTMLImageElement;
  private readonly handles: HTMLElement[];

  constructor(
    private node: ProseNode,
    private view: EditorView,
    private getPos: () => number | undefined,
  ) {
    const document = view.dom.ownerDocument;
    this.dom = document.createElement('div');
    this.dom.className = 'tx-editor__image';
    this.image = document.createElement('img');
    this.image.draggable = false;
    this.handles = (['left', 'right'] as const).map((side) => {
      const handle = document.createElement('span');
      handle.className = 'tx-editor__image-handle';
      handle.setAttribute('data-side', side);
      handle.setAttribute('aria-hidden', 'true');
      handle.addEventListener('pointerdown', (event) => this.resize(event, side));
      return handle;
    });
    this.dom.append(this.image, ...this.handles);
    this.render();
  }

  update(node: ProseNode): boolean {
    if (node.type !== this.node.type) {
      return false;
    }
    this.node = node;
    this.render();
    return true;
  }

  selectNode(): void {
    this.dom.classList.add('tx-editor__image--selected');
  }

  deselectNode(): void {
    this.dom.classList.remove('tx-editor__image--selected');
  }

  stopEvent(event: Event): boolean {
    return this.handles.includes(event.target as HTMLElement);
  }

  ignoreMutation(): boolean {
    return true;
  }

  private render(): void {
    const { src, alt, title, width } = this.node.attrs;
    this.image.src = String(src);
    this.image.alt = alt ? String(alt) : '';
    if (title) {
      this.image.title = String(title);
    } else {
      this.image.removeAttribute('title');
    }
    this.image.style.width = width ? `${width}px` : '';
  }

  private resize(event: PointerEvent, side: 'left' | 'right'): void {
    if (!this.view.editable || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture?.(event.pointerId);
    const start = event.clientX;
    const startWidth = this.image.getBoundingClientRect().width;
    const max = Math.max(MIN_IMAGE_WIDTH, this.view.dom.clientWidth);
    const direction = side === 'left' ? -1 : 1;
    let width = startWidth;
    this.dom.classList.add('tx-editor__image--resizing');
    const move = (next: PointerEvent) => {
      width = Math.round(Math.min(max, Math.max(MIN_IMAGE_WIDTH, startWidth + (next.clientX - start) * direction)));
      this.image.style.width = `${width}px`;
    };
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      this.dom.classList.remove('tx-editor__image--resizing');
      const pos = this.getPos();
      if (pos !== undefined && Math.round(width) !== Math.round(startWidth)) {
        this.view.dispatch(this.view.state.tr.setNodeMarkup(pos, undefined, { ...this.node.attrs, width: String(width) }));
      }
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }
}
