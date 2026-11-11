import { EditorState, Extension, Range, RangeSet, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, GutterMarker, WidgetType, gutter } from '@codemirror/view';
import { TxCodeSegment, lineIndent } from '@tectra-ng/code-editor/highlight';
import { TxCodeDiffChange, rangesByLine } from './diff';
import { TX_DIFF_INSERTED_TEXT, TX_DIFF_REMOVED_TEXT, TxDiffDocument, TxDiffRow, markedSegments } from './diff-rows';

export type TxDiffSide = 'inline' | 'original' | 'modified';

interface DiffDecorations {
  readonly decorations: DecorationSet;
  readonly markers: RangeSet<GutterMarker>;
}

export const setDiffDecorations = StateEffect.define<DiffDecorations>();

function appendSegments(parent: HTMLElement, segments: readonly TxCodeSegment[]): void {
  const document = parent.ownerDocument;
  for (const segment of segments) {
    const span = document.createElement('span');
    if (segment.className) {
      span.className = segment.className;
    }
    span.textContent = segment.text;
    parent.appendChild(span);
  }
  if (!segments.length) {
    parent.appendChild(document.createElement('br'));
  }
}

class RemovedLinesWidget extends WidgetType {
  constructor(
    readonly rows: readonly TxDiffRow[],
    readonly key: string,
    readonly guides: boolean,
    readonly tabSize: number,
  ) {
    super();
  }

  override eq(other: RemovedLinesWidget): boolean {
    return other.key === this.key && other.guides === this.guides && other.tabSize === this.tabSize;
  }

  get lines(): number {
    return this.rows.length;
  }

  toDOM(view: EditorView): HTMLElement {
    const document = view.dom.ownerDocument;
    const block = document.createElement('div');
    block.className = 'tx-code-diff__removed';
    block.setAttribute('aria-hidden', 'true');
    for (const row of this.rows) {
      const line = document.createElement('div');
      line.className = 'tx-code-diff__row tx-code-diff__line--removed';
      if (row.indent) {
        line.style.setProperty('--tx-code-wrap-indent', row.indent);
      }
      if (this.guides && row.guides > 0) {
        line.classList.add('tx-code-guides');
        line.style.setProperty('--tx-code-guides', String(row.guides));
        line.style.setProperty('--tx-code-guide-step', `${this.tabSize}ch`);
      }
      appendSegments(line, row.segments);
      block.appendChild(line);
    }
    return block;
  }

  override get estimatedHeight(): number {
    return -1;
  }

  override ignoreEvent(): boolean {
    return false;
  }
}

class FillerWidget extends WidgetType {
  constructor(readonly lines: number) {
    super();
  }

  override eq(other: FillerWidget): boolean {
    return other.lines === this.lines;
  }

  toDOM(view: EditorView): HTMLElement {
    const filler = view.dom.ownerDocument.createElement('div');
    filler.className = 'tx-code-diff__filler';
    filler.setAttribute('aria-hidden', 'true');
    filler.style.setProperty('--tx-code-diff-filler-lines', String(this.lines));
    return filler;
  }
}

class SignMarker extends GutterMarker {
  constructor(
    readonly sign: '+' | '−',
    readonly rows = 1,
  ) {
    super();
  }

  override eq(other: SignMarker): boolean {
    return other.sign === this.sign && other.rows === this.rows;
  }

  override toDOM(view: EditorView): Node {
    const document = view.dom.ownerDocument;
    const marker = document.createElement('div');
    marker.className = `tx-code-diff__sign tx-code-diff__sign--${this.sign === '+' ? 'inserted' : 'removed'}`;
    for (let index = 0; index < this.rows; index++) {
      const row = document.createElement('div');
      row.textContent = this.sign;
      marker.appendChild(row);
    }
    return marker;
  }
}

const INSERTED_LINE = Decoration.line({ class: 'tx-code-diff__line--inserted' });
const REMOVED_LINE = Decoration.line({ class: 'tx-code-diff__line--removed' });
const INSERTED_TEXT = Decoration.mark({ class: TX_DIFF_INSERTED_TEXT });
const REMOVED_TEXT = Decoration.mark({ class: TX_DIFF_REMOVED_TEXT });
const PLUS = new SignMarker('+');
const MINUS = new SignMarker('−');

function blockPosition(state: EditorState, lineIndex: number): { position: number; side: number } {
  return lineIndex < state.doc.lines ? { position: state.doc.line(lineIndex + 1).from, side: -1 } : { position: state.doc.length, side: 1 };
}

function markLines(
  state: EditorState,
  from: number,
  to: number,
  ranges: TxCodeDiffChange['modifiedRanges'],
  line: Decoration,
  text: Decoration,
  marker: SignMarker,
  decorations: Range<Decoration>[],
  markers: Range<GutterMarker>[],
): void {
  const lines: string[] = [];
  for (let index = from; index < to && index < state.doc.lines; index++) {
    lines.push(state.doc.line(index + 1).text);
  }
  const marks = rangesByLine(lines, ranges);
  lines.forEach((_, offset) => {
    const docLine = state.doc.line(from + offset + 1);
    decorations.push(line.range(docLine.from));
    markers.push(marker.range(docLine.from));
    for (const mark of marks[offset]) {
      decorations.push(text.range(docLine.from + mark.from, docLine.from + mark.to));
    }
  });
}

export function buildDiffDecorations(
  state: EditorState,
  side: TxDiffSide,
  original: TxDiffDocument,
  changes: readonly TxCodeDiffChange[],
  guides = true,
): DiffDecorations {
  const decorations: Range<Decoration>[] = [];
  const markers: Range<GutterMarker>[] = [];
  for (const change of changes) {
    const removedCount = change.originalTo - change.originalFrom;
    const insertedCount = change.modifiedTo - change.modifiedFrom;
    if (side === 'inline') {
      if (removedCount) {
        const lines = original.lines.slice(change.originalFrom, change.originalTo);
        const marks = rangesByLine(lines, change.originalRanges);
        const rows: TxDiffRow[] = lines.map((text, offset) => ({
          kind: 'removed',
          number: null,
          segments: markedSegments(text, original.tokens[change.originalFrom + offset] ?? [], marks[offset], TX_DIFF_REMOVED_TEXT),
          indent: lineIndent(text),
          guides: original.guides[change.originalFrom + offset] ?? 0,
        }));
        const key = `${lines.join('\n')}|${change.originalRanges.map((range) => `${range.from}-${range.to}`).join(',')}`;
        const { position, side: blockSide } = blockPosition(state, change.modifiedFrom);
        decorations.push(Decoration.widget({ widget: new RemovedLinesWidget(rows, key, guides, original.tabSize), block: true, side: blockSide }).range(position));
      }
      markLines(state, change.modifiedFrom, change.modifiedTo, change.modifiedRanges, INSERTED_LINE, INSERTED_TEXT, PLUS, decorations, markers);
    } else {
      const own = side === 'original' ? removedCount : insertedCount;
      const other = side === 'original' ? insertedCount : removedCount;
      const from = side === 'original' ? change.originalFrom : change.modifiedFrom;
      const to = side === 'original' ? change.originalTo : change.modifiedTo;
      if (side === 'original') {
        markLines(state, from, to, change.originalRanges, REMOVED_LINE, REMOVED_TEXT, MINUS, decorations, markers);
      } else {
        markLines(state, from, to, change.modifiedRanges, INSERTED_LINE, INSERTED_TEXT, PLUS, decorations, markers);
      }
      if (other > own) {
        const { position, side: blockSide } = blockPosition(state, to);
        decorations.push(Decoration.widget({ widget: new FillerWidget(other - own), block: true, side: blockSide }).range(position));
      }
    }
  }
  return {
    decorations: Decoration.set(decorations, true),
    markers: RangeSet.of(markers, true),
  };
}

const EMPTY: DiffDecorations = { decorations: Decoration.none, markers: RangeSet.empty };

export const diffField = StateField.define<DiffDecorations>({
  create: () => EMPTY,
  update(value, transaction) {
    let next = transaction.docChanged ? { decorations: value.decorations.map(transaction.changes), markers: value.markers.map(transaction.changes) } : value;
    for (const effect of transaction.effects) {
      if (effect.is(setDiffDecorations)) {
        next = effect.value;
      }
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field, (value) => value.decorations),
});

export function diffGutter(): Extension {
  return gutter({
    class: 'tx-code-diff__signs',
    markers: (view) => view.state.field(diffField).markers,
    widgetMarker: (_view, widget) => (widget instanceof RemovedLinesWidget ? new SignMarker('−', widget.lines) : null),
    initialSpacer: () => PLUS,
  });
}
