import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { EditorSelection, EditorState, Extension, Transaction } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxCodeLanguage, TxCodeSyntaxStyles, resolveCodeLanguage } from '@tectra-ng/code-editor/highlight';
import { TectraCodeDiffTokens, TectraCodeSyntaxTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxCodeDiffPart, TxCodeDiffSummary, TxCodeDiffView } from './code-editor.types';
import { TxCodeDiffChange, diffCode, summarizeDiff } from './diff/diff';
import { diffDocument, inlineRows, splitRows } from './diff/diff-rows';
import { TxDiffSide, buildDiffDecorations, diffField, diffGutter, setDiffDecorations } from './diff/diff-view';
import { detectTabSize } from './engine/commands';
import { historyAction } from './engine/history';
import { TxCodeEditorCompartments, codeEditorBase, tabKeys } from './engine/setup';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CODE_EDITOR_ICON_DEFAULTS } from './code-editor.icons';
import { CODE_EDITOR_THEME } from './code-editor.theme';

/** Design tokens of `tx-code-diff` for `dt`: the `codeDiff` group and `syntax` colours. */
export type TxCodeDiffTokens = TectraCodeDiffTokens & { syntax: TectraCodeSyntaxTokens };

const RECOMPUTE_DELAY = 150;

@Component({
  selector: 'tx-code-diff',
  imports: [NgTemplateOutlet],
  templateUrl: './code-diff.component.html',
  styleUrl: './code-diff.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-code-diff',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-view]': 'view()',
    '[class.tx-code-diff--split]': "view() === 'split'",
    '[class.tx-code-diff--numbers]': 'lineNumbers()',
    '[class.tx-code-diff--wrap]': "wordWrap() && view() === 'inline'",
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() ?? t().codeDiffLabel',
  },
  viewProviders: [provideTxIconDefaults(CODE_EDITOR_ICON_DEFAULTS)],
})
export class TxCodeDiff {
  private readonly codeEditorTheme = injectTokens(CODE_EDITOR_THEME);

  readonly original = input<string | null>('');
  readonly value = model<string | null>('');
  readonly language = input<TxCodeLanguage | string>('html');
  readonly view = input<TxCodeDiffView>('inline');
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly lineNumbers = input(true, { transform: booleanAttribute });
  readonly wordWrap = input(true, { transform: booleanAttribute });
  readonly indentGuides = input(true, { transform: booleanAttribute });
  readonly ignoreTrimWhitespace = input(true, { transform: booleanAttribute });
  readonly scrollToFirstChange = input(true, { transform: booleanAttribute });
  readonly height = input<string | undefined>('600px');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TxCodeDiffTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCodeDiffPart, TxCodeDiff> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxCodeDiffSummary>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('codeDiff', this, this.pt, this.ptOptions);
  protected readonly t = injectTranslations();
  private readonly destroyRef = inject(DestroyRef);

  private readonly originalMount = viewChild<ElementRef<HTMLElement>>('originalMount');
  private readonly modifiedMount = viewChild<ElementRef<HTMLElement>>('modifiedMount');

  protected readonly ready = signal(false);
  private readonly modifiedText = signal<string | null>(null);

  readonly resolvedLanguage = computed<TxCodeLanguage>(() => resolveCodeLanguage(this.language()) ?? 'plain');
  private readonly originalDocument = computed(() => diffDocument(this.original() ?? '', this.resolvedLanguage()));
  private readonly currentText = computed(() => this.modifiedText() ?? this.value() ?? '');
  protected readonly guideStep = computed(() => `${detectTabSize(this.currentText())}ch`);

  readonly changes = computed<readonly TxCodeDiffChange[]>(() =>
    diffCode(this.original() ?? '', this.currentText(), { ignoreTrimWhitespace: this.ignoreTrimWhitespace() }),
  );
  readonly summary = computed<TxCodeDiffSummary>(() => summarizeDiff(this.changes()));

  protected readonly staticInline = computed(() =>
    this.ready() || this.view() !== 'inline' ? [] : inlineRows(this.originalDocument(), diffDocument(this.currentText(), this.resolvedLanguage()), this.changes()),
  );
  protected readonly staticSplit = computed(() =>
    this.ready() || this.view() !== 'split'
      ? { original: [], modified: [] }
      : splitRows(this.originalDocument(), diffDocument(this.currentText(), this.resolvedLanguage()), this.changes()),
  );

  readonly hostStyle = computed(() => {
    const { syntax, ...own } = this.dt() ?? {};
    return {
      ...toStyleObject(own, '--tx-code-diff'),
      ...toStyleObject(syntax, '--tx-code-syntax'),
      ...(this.height() ? { height: this.height() } : {}),
      ...this.passThrough().root?.style,
    };
  });

  private originalView: EditorView | null = null;
  private modifiedView: EditorView | null = null;
  private builtFor = '';
  private scrolled = false;
  private recomputeTimer: ReturnType<typeof setTimeout> | undefined;
  private syncing: EditorView | null = null;
  private escaped = false;
  private readonly compartments = new TxCodeEditorCompartments();
  private readonly originalCompartments = new TxCodeEditorCompartments();

  constructor() {
    inject(TxStyleLoader).load(TxCodeSyntaxStyles);

    afterRenderEffect(() => {
      const key = [this.view(), this.resolvedLanguage(), this.readOnly(), this.lineNumbers(), this.wordWrap(), this.indentGuides()].join('|');
      const modified = this.modifiedMount();
      const original = this.originalMount();
      untracked(() => {
        if (!modified || key === this.builtFor) {
          return;
        }
        this.destroyViews();
        this.builtFor = key;
        this.createViews(modified.nativeElement, original?.nativeElement ?? null);
      });
    });

    effect(() => {
      const value = this.value() ?? '';
      untracked(() => {
        const view = this.modifiedView;
        if (view && value !== view.state.doc.toString()) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: value },
            annotations: [historyAction.of('reset'), Transaction.addToHistory.of(false)],
          });
          this.modifiedText.set(null);
          this.scrolled = false;
        }
      });
    });

    effect(() => {
      const original = this.original() ?? '';
      untracked(() => {
        const view = this.originalView;
        if (view && original !== view.state.doc.toString()) {
          view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: original } });
          this.scrolled = false;
        }
      });
    });

    effect(() => {
      const changes = this.changes();
      const original = this.originalDocument();
      this.changed.emit(this.summary());
      untracked(() => this.applyDecorations(changes, original));
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.recomputeTimer);
      this.destroyViews();
    });
  }

  nextChange(): boolean {
    return this.goToChange(1);
  }

  previousChange(): boolean {
    return this.goToChange(-1);
  }

  private goToChange(direction: 1 | -1): boolean {
    const view = this.modifiedView;
    const changes = this.changes();
    if (!view || !changes.length) {
      return false;
    }
    const line = view.state.doc.lineAt(view.state.selection.main.head).number - 1;
    const ordered = direction > 0 ? changes : [...changes].reverse();
    const target =
      ordered.find((change) => (direction > 0 ? change.modifiedFrom > line : change.modifiedFrom < line)) ?? ordered[0];
    const position = view.state.doc.line(Math.min(target.modifiedFrom + 1, view.state.doc.lines)).from;
    view.dispatch({ selection: EditorSelection.cursor(position), effects: EditorView.scrollIntoView(position, { y: 'center' }) });
    return true;
  }

  private editorExtensions(compartments: TxCodeEditorCompartments, side: TxDiffSide, doc: string, readOnly: boolean): Extension[] {
    const label = side === 'original' ? this.t().codeDiffOriginal : side === 'modified' ? this.t().codeDiffModified : (this.ariaLabel() ?? this.t().codeDiffLabel);
    return [
      codeEditorBase(),
      compartments.initial({
        language: this.resolvedLanguage(),
        readOnly,
        editable: true,
        lineNumbers: this.lineNumbers(),
        wordWrap: side === 'inline' && this.wordWrap(),
        tabSize: detectTabSize(doc),
        placeholder: '',
        indentGuides: this.indentGuides(),
        attributes: { 'aria-label': label, 'aria-multiline': 'true', tabindex: '0', ...(readOnly ? { 'aria-readonly': 'true' } : {}) },
      }),
      diffField,
      diffGutter(),
      keymap.of([
        { key: 'F7', run: () => this.goToChange(1), shift: () => this.goToChange(-1), preventDefault: true },
        ...tabKeys(() => this.escaped),
      ]),
      EditorView.domEventHandlers({
        keydown: (event) => {
          this.escaped = event.key === 'Escape' || (this.escaped && (event.key === 'Tab' || event.key === 'Shift'));
          return false;
        },
      }),
    ];
  }

  private createViews(modifiedParent: HTMLElement, originalParent: HTMLElement | null): void {
    const modifiedDoc = this.value() ?? '';
    const split = this.view() === 'split' && !!originalParent;
    modifiedParent.querySelector('.tx-code-diff__static')?.setAttribute('hidden', '');
    originalParent?.querySelector('.tx-code-diff__static')?.setAttribute('hidden', '');
    this.modifiedView = new EditorView({
      parent: modifiedParent,
      state: EditorState.create({
        doc: modifiedDoc,
        extensions: [
          this.editorExtensions(this.compartments, split ? 'modified' : 'inline', modifiedDoc, this.readOnly()),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(historyAction) === 'reset')) {
              const text = update.state.doc.toString();
              if (this.modifiedText() === null) {
                this.modifiedText.set(update.startState.doc.toString());
              }
              this.value.set(text);
              clearTimeout(this.recomputeTimer);
              this.recomputeTimer = setTimeout(() => this.modifiedText.set(text), RECOMPUTE_DELAY);
            }
          }),
        ],
      }),
    });
    if (split && originalParent) {
      const originalDoc = this.original() ?? '';
      this.originalView = new EditorView({
        parent: originalParent,
        state: EditorState.create({ doc: originalDoc, extensions: this.editorExtensions(this.originalCompartments, 'original', originalDoc, true) }),
      });
      this.syncScroll(this.originalView, this.modifiedView);
      this.syncScroll(this.modifiedView, this.originalView);
    }
    this.ready.set(true);
    this.applyDecorations(this.changes(), this.originalDocument());
  }

  private syncScroll(source: EditorView, target: EditorView): void {
    source.scrollDOM.addEventListener('scroll', () => {
      if (this.syncing === source) {
        this.syncing = null;
        return;
      }
      if (Math.abs(target.scrollDOM.scrollTop - source.scrollDOM.scrollTop) > 1 || target.scrollDOM.scrollLeft !== source.scrollDOM.scrollLeft) {
        this.syncing = target;
        target.scrollDOM.scrollTop = source.scrollDOM.scrollTop;
        target.scrollDOM.scrollLeft = source.scrollDOM.scrollLeft;
      }
    });
  }

  private applyDecorations(changes: readonly TxCodeDiffChange[], original: ReturnType<typeof diffDocument>): void {
    const modified = this.modifiedView;
    if (!modified || this.currentText() !== modified.state.doc.toString()) {
      return;
    }
    const split = !!this.originalView;
    modified.dispatch({ effects: setDiffDecorations.of(buildDiffDecorations(modified.state, split ? 'modified' : 'inline', original, changes, this.indentGuides())) });
    if (this.originalView) {
      const left = this.originalView;
      left.dispatch({ effects: setDiffDecorations.of(buildDiffDecorations(left.state, 'original', original, changes, this.indentGuides())) });
    }
    if (!this.scrolled && changes.length && this.scrollToFirstChange()) {
      this.scrolled = true;
      const first = changes[0];
      const position = modified.state.doc.line(Math.min(first.modifiedFrom + 1, modified.state.doc.lines)).from;
      this.centerInside(modified, position);
    }
  }

  private centerInside(view: EditorView, position: number): void {
    view.requestMeasure({
      read: () => {
        const block = view.lineBlockAt(position);
        return Math.max(0, block.top - (view.scrollDOM.clientHeight - block.height) / 2);
      },
      write: (scrollTop) => {
        view.scrollDOM.scrollTop = scrollTop;
      },
    });
  }

  private destroyViews(): void {
    this.modifiedView?.destroy();
    this.originalView?.destroy();
    this.modifiedView = null;
    this.originalView = null;
    this.builtFor = '';
    this.scrolled = false;
    this.ready.set(false);
  }
}
