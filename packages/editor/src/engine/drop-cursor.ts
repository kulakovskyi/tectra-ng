import { Plugin } from 'prosemirror-state';
import { dropPoint } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

interface TxBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

class TxDropCursorView {
  private element: HTMLElement | null = null;
  private position: number | null = null;
  private readonly listeners: [string, (event: Event) => void][];

  constructor(private view: EditorView) {
    this.listeners = [
      ['dragover', (event) => this.onDragOver(event as DragEvent)],
      ['dragend', () => this.show(null)],
      ['drop', () => this.show(null)],
      ['dragleave', (event) => this.onDragLeave(event as DragEvent)],
    ];
    this.listeners.forEach(([name, listener]) => view.dom.addEventListener(name, listener));
  }

  update(view: EditorView): void {
    this.view = view;
    if (this.position !== null && this.position > view.state.doc.content.size) {
      this.show(null);
    }
  }

  destroy(): void {
    this.listeners.forEach(([name, listener]) => this.view.dom.removeEventListener(name, listener));
    this.element?.remove();
  }

  private onDragOver(event: DragEvent): void {
    if (!this.view.editable) {
      return;
    }
    const found = this.view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (!found) {
      return;
    }
    const slice = this.view.dragging?.slice;
    const point = slice ? dropPoint(this.view.state.doc, found.pos, slice) : found.pos;
    this.show(point ?? found.pos);
  }

  private onDragLeave(event: DragEvent): void {
    if (!event.relatedTarget || !this.view.dom.contains(event.relatedTarget as Node)) {
      this.show(null);
    }
  }

  private show(position: number | null): void {
    if (position === this.position) {
      return;
    }
    this.position = position;
    if (position === null) {
      this.element?.remove();
      this.element = null;
      return;
    }
    this.place(position);
  }

  private place(position: number): void {
    const view = this.view;
    const $pos = view.state.doc.resolve(position);
    let box: TxBox | null = null;
    if (!$pos.parent.inlineContent) {
      const before = $pos.nodeBefore;
      const after = $pos.nodeAfter;
      const beforeDom = before ? (view.nodeDOM(position - before.nodeSize) as HTMLElement | null) : null;
      const afterDom = after ? (view.nodeDOM(position) as HTMLElement | null) : null;
      const reference = (beforeDom ?? afterDom)?.getBoundingClientRect();
      if (reference) {
        const top = beforeDom && afterDom ? (beforeDom.getBoundingClientRect().bottom + afterDom.getBoundingClientRect().top) / 2 : beforeDom ? reference.bottom : reference.top;
        box = { left: reference.left, right: reference.right, top: top - 1, bottom: top + 1 };
      }
    }
    if (!box) {
      const coords = view.coordsAtPos(position);
      box = { left: coords.left - 1, right: coords.left + 1, top: coords.top, bottom: coords.bottom };
    }
    const parent = (view.dom.offsetParent as HTMLElement | null) ?? view.dom;
    if (!this.element) {
      this.element = view.dom.ownerDocument.createElement('div');
      this.element.className = 'tx-editor__drop-cursor';
      parent.appendChild(this.element);
    }
    const origin = parent.getBoundingClientRect();
    Object.assign(this.element.style, {
      left: `${box.left - origin.left + parent.scrollLeft}px`,
      top: `${box.top - origin.top + parent.scrollTop}px`,
      width: `${box.right - box.left}px`,
      height: `${box.bottom - box.top}px`,
    });
  }
}

export function dropCursor(): Plugin {
  return new Plugin({ view: (view) => new TxDropCursorView(view) });
}
