import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorSelection, EditorState, Extension, Prec, Transaction } from '@codemirror/state';
import { EditorView, KeyBinding, ViewUpdate, keymap } from '@codemirror/view';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TxCodeLanguage, TxCodeSyntaxStyles, codeLines, resolveCodeLanguage } from '@tectra-ng/code-editor/highlight';
import { TectraCodeEditorTokens, TectraCodeSyntaxTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxCodeDiff } from './code-diff.component';
import { TxCodeDiffSummary, TxCodeDiffView, TxCodeEditorPart } from './code-editor.types';
import { detectTabSize } from './engine/commands';
import { historyAction, redo, undo } from './engine/history';
import { TxCodeSearchQuery, findMatches, replacementFor, setSearchMarks } from './engine/search';
import { TxCodeCompartmentName, TxCodeEditorCompartments, codeEditorBase, tabKeys } from './engine/setup';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CODE_EDITOR_ICON_DEFAULTS } from './code-editor.icons';
import { CODE_EDITOR_THEME } from './code-editor.theme';

export type TxCodeEditorTokens = TectraCodeEditorTokens & { syntax: TectraCodeSyntaxTokens };

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

@Component({
  selector: 'tx-code-editor',
  imports: [TxButton, TxInput, TxCodeDiff],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxCodeEditor), multi: true }],
  host: {
    class: 'tx-code-editor',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-language]': 'resolvedLanguage()',
    '[class.tx-code-editor--focused]': 'focusedState()',
    '[class.tx-code-editor--invalid]': 'isInvalid()',
    '[class.tx-code-editor--disabled]': 'isDisabled()',
    '[class.tx-code-editor--readonly]': 'readOnly()',
    '[class.tx-code-editor--wrap]': 'wordWrap()',
    '[class.tx-code-editor--numbers]': 'lineNumbers()',
    '[class.tx-code-editor--diff]': 'diffMode()',
  },
  viewProviders: [provideTxIconDefaults(CODE_EDITOR_ICON_DEFAULTS)],
})
export class TxCodeEditor implements ControlValueAccessor {
  private readonly codeEditorTheme = injectTokens(CODE_EDITOR_THEME);

  readonly value = model<string | null>('');
  readonly language = input<TxCodeLanguage | string>('html');
  readonly height = input<string | undefined>('600px');
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly lineNumbers = input(true, { transform: booleanAttribute });
  readonly wordWrap = input(true, { transform: booleanAttribute });
  readonly indentGuides = input(true, { transform: booleanAttribute });
  readonly tabSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly placeholder = input<string>('');
  readonly search = input(true, { transform: booleanAttribute });
  readonly disabled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly diffMode = input(false, { transform: booleanAttribute });
  readonly originalValue = input<string | null>('');
  readonly diffView = input<TxCodeDiffView>('inline');
  readonly dt = input<TectraDeepPartial<TxCodeEditorTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCodeEditorPart, TxCodeEditor> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly codeChanged = output<string>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();
  readonly diffChanged = output<TxCodeDiffSummary>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('codeEditor', this, this.pt, this.ptOptions);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  protected readonly t = injectTranslations();
  private readonly locale = inject(TxLocaleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly mount = viewChild<ElementRef<HTMLElement>>('mount');
  private readonly findInput = viewChild<ElementRef<HTMLInputElement>>('findInput');
  private readonly replaceInput = viewChild<ElementRef<HTMLInputElement>>('replaceInput');

  private readonly formDisabled = signal(false);
  private readonly docVersion = signal(0);
  protected readonly ready = signal(false);
  protected readonly focusedState = signal(false);

  protected readonly searchOpen = signal(false);
  protected readonly replaceOpen = signal(false);
  protected readonly query = signal('');
  protected readonly replacement = signal('');
  protected readonly matchCase = signal(false);
  protected readonly wholeWord = signal(false);
  protected readonly regexp = signal(false);
  private readonly currentMatch = signal(-1);

  private view: EditorView | null = null;
  private text = '';
  private applyingExternal = false;
  private escaped = false;
  private detectedTabSize = 4;
  private readonly compartments = new TxCodeEditorCompartments();
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly resolvedLanguage = computed<TxCodeLanguage>(() => resolveCodeLanguage(this.language()) ?? 'plain');
  readonly isDisabled = computed(() => this.disabled() ?? this.formDisabled());
  private readonly label = computed(() => this.ariaLabel() ?? (this.ariaLabelledBy() ? undefined : this.t().codeEditorLabel));

  protected readonly staticLines = computed(() => {
    if (this.ready()) {
      return [];
    }
    return codeLines(this.value() ?? '', this.resolvedLanguage(), 1, this.staticTabSize());
  });
  protected readonly staticTabSize = computed(() => this.tabSize() ?? detectTabSize(this.value() ?? ''));
  protected readonly staticEmpty = computed(() => !(this.value() ?? ''));

  readonly hostStyle = computed(() => {
    const { syntax, ...own } = this.dt() ?? {};
    return {
      ...toStyleObject(own, '--tx-code-editor'),
      ...toStyleObject(syntax, '--tx-code-syntax'),
      ...(this.height() ? { height: this.height() } : {}),
      ...this.passThrough().root?.style,
    };
  });

  private readonly searchQuery = computed<TxCodeSearchQuery>(() => ({
    text: this.query(),
    matchCase: this.matchCase(),
    wholeWord: this.wholeWord(),
    regexp: this.regexp(),
  }));

  protected readonly searchResult = computed(() => {
    this.docVersion();
    return this.searchOpen() ? findMatches(this.text, this.searchQuery()) : { matches: [], valid: true, pattern: null };
  });

  protected readonly current = computed(() => {
    const total = this.searchResult().matches.length;
    const index = this.currentMatch();
    return total ? Math.min(Math.max(index, 0), total - 1) : -1;
  });

  protected readonly countText = computed(() => {
    const total = this.searchResult().matches.length;
    if (!this.query()) {
      return '';
    }
    if (!total) {
      return this.t().codeSearchNoResults;
    }
    return this.locale.format(this.t().codeSearchCount, { current: this.current() + 1, total });
  });

  constructor() {
    inject(TxStyleLoader).load(TxCodeSyntaxStyles);

    afterRenderEffect(() => {
      const mount = this.mount();
      if (mount && !this.view) {
        this.createView(mount.nativeElement);
      } else if (!mount && this.view) {
        this.destroyView();
      }
    });

    effect(() => {
      const value = this.value() ?? '';
      untracked(() => {
        if (this.view && value !== this.text) {
          this.replaceDocument(value);
        }
      });
    });

    effect(() => this.reconfigure('language', this.compartments.languageExtension(this.resolvedLanguage())));
    effect(() => this.reconfigure('readOnly', this.compartments.readOnlyExtension(this.readOnly(), !this.isDisabled())));
    effect(() => this.reconfigure('gutter', this.compartments.gutterExtension(this.lineNumbers())));
    effect(() => this.reconfigure('wrap', this.compartments.wrapExtension(this.wordWrap())));
    effect(() => this.reconfigure('tabSize', this.compartments.tabSizeExtension(this.tabSize() ?? this.detectedTabSize)));
    effect(() => this.reconfigure('placeholder', this.compartments.placeholderExtension(this.placeholder())));
    effect(() => this.reconfigure('guides', this.compartments.guidesExtension(this.indentGuides())));
    effect(() => this.reconfigure('attributes', this.compartments.attributesExtension(this.contentAttributes())));

    effect(() => {
      const open = this.searchOpen();
      const matches = this.searchResult().matches;
      const current = this.current();
      untracked(() => this.view?.dispatch({ effects: setSearchMarks.of({ matches: open ? matches : [], current }) }));
    });

    this.destroyRef.onDestroy(() => this.destroyView());
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  focus(): void {
    this.view?.focus();
  }

  undo(): boolean {
    return this.view ? undo(this.view) : false;
  }

  redo(): boolean {
    return this.view ? redo(this.view) : false;
  }

  openSearch(replace = false): void {
    if (!this.search() || this.diffMode()) {
      return;
    }
    const view = this.view;
    if (view) {
      const { from, to } = view.state.selection.main;
      const selected = view.state.sliceDoc(from, to);
      if (selected && !selected.includes('\n')) {
        this.query.set(selected);
      }
    }
    this.searchOpen.set(true);
    this.replaceOpen.set(replace || (this.replaceOpen() && this.searchOpen()));
    this.revealFrom(view?.state.selection.main.from ?? 0, false);
    afterNextRender(
      () => {
        const input = (replace ? this.replaceInput() : this.findInput())?.nativeElement;
        input?.focus();
        input?.select();
      },
      { injector: this.injector },
    );
  }

  closeSearch(): void {
    if (!this.searchOpen()) {
      return;
    }
    this.searchOpen.set(false);
    this.view?.focus();
  }

  findNext(): void {
    this.step(1);
  }

  findPrevious(): void {
    this.step(-1);
  }

  replaceCurrent(): void {
    const view = this.view;
    const matches = this.searchResult().matches;
    const index = this.current();
    if (!view || index < 0 || view.state.readOnly) {
      return;
    }
    const match = matches[index];
    const insert = replacementFor(view.state, match, this.searchQuery(), this.replacement());
    view.dispatch({ changes: { from: match.from, to: match.to, insert }, userEvent: 'input.replace' });
    this.revealFrom(match.from + insert.length, true);
  }

  replaceAll(): void {
    const view = this.view;
    const matches = this.searchResult().matches;
    if (!view || !matches.length || view.state.readOnly) {
      return;
    }
    const query = this.searchQuery();
    const replacement = this.replacement();
    view.dispatch({
      changes: matches.map((match) => ({ from: match.from, to: match.to, insert: replacementFor(view.state, match, query, replacement) })),
      userEvent: 'input.replace.all',
    });
  }

  protected toggleReplace(): void {
    this.replaceOpen.update((open) => !open);
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.revealFrom(this.view?.state.selection.main.from ?? 0, true);
  }

  protected toggleOption(option: 'matchCase' | 'wholeWord' | 'regexp'): void {
    this[option].update((on) => !on);
    this.revealFrom(this.view?.state.selection.main.from ?? 0, true);
  }

  protected onSearchKeydown(event: KeyboardEvent, field: 'find' | 'replace'): void {
    const mod = isMac ? event.metaKey : event.ctrlKey;
    const key = event.key.toLowerCase();
    const replaceKey = isMac ? mod && event.altKey && event.code === 'KeyF' : mod && key === 'h';
    if (replaceKey || (mod && !event.altKey && key === 'f')) {
      event.preventDefault();
      if (replaceKey) {
        this.replaceOpen.set(true);
      }
      afterNextRender(() => (replaceKey ? this.replaceInput() : this.findInput())?.nativeElement.focus(), { injector: this.injector });
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSearch();
    } else if (event.key === 'Enter' && field === 'find') {
      event.preventDefault();
      this.step(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Enter' && field === 'replace') {
      event.preventDefault();
      if (event.metaKey || event.ctrlKey) {
        this.replaceAll();
      } else {
        this.replaceCurrent();
      }
    } else if (event.key === 'F3') {
      event.preventDefault();
      this.step(event.shiftKey ? -1 : 1);
    }
  }

  protected onDiffValue(next: string | null): void {
    const value = next ?? '';
    this.text = value;
    this.value.set(value);
    this.codeChanged.emit(value);
    this.onChange(value);
  }

  private step(direction: 1 | -1): void {
    const total = this.searchResult().matches.length;
    if (!total) {
      return;
    }
    const next = (this.current() + direction + total) % total;
    this.select(next);
  }

  private revealFrom(position: number, select: boolean): void {
    const matches = this.searchResult().matches;
    if (!matches.length) {
      this.currentMatch.set(-1);
      return;
    }
    const index = matches.findIndex((match) => match.from >= position);
    const target = index < 0 ? 0 : index;
    if (select) {
      this.select(target);
    } else {
      this.currentMatch.set(target);
    }
  }

  private select(index: number): void {
    const match = this.searchResult().matches[index];
    this.currentMatch.set(index);
    if (match && this.view) {
      this.view.dispatch({
        selection: EditorSelection.single(match.from, match.to),
        effects: EditorView.scrollIntoView(match.from, { y: 'center' }),
        userEvent: 'select.search',
      });
    }
  }

  private contentAttributes(): Record<string, string> {
    const attributes: Record<string, string> = { 'aria-multiline': 'true' };
    if (!this.isDisabled()) {
      attributes['tabindex'] = '0';
    }
    const label = this.label();
    if (label) {
      attributes['aria-label'] = label;
    }
    if (this.ariaLabelledBy()) {
      attributes['aria-labelledby'] = this.ariaLabelledBy() as string;
    }
    if (this.isInvalid()) {
      attributes['aria-invalid'] = 'true';
    }
    if (this.readOnly()) {
      attributes['aria-readonly'] = 'true';
    }
    if (this.isDisabled()) {
      attributes['aria-disabled'] = 'true';
    }
    return attributes;
  }

  private searchKeys(): KeyBinding[] {
    if (!this.search()) {
      return [];
    }
    return [
      { key: 'Mod-f', run: () => (this.openSearch(false), true), preventDefault: true },
      { key: isMac ? 'Mod-Alt-f' : 'Mod-h', run: () => (this.openSearch(true), true), preventDefault: true },
      { key: 'F3', run: () => (this.searchOpen() ? (this.findNext(), true) : false), shift: () => (this.searchOpen() ? (this.findPrevious(), true) : false) },
      { key: 'Mod-g', run: () => (this.searchOpen() ? (this.findNext(), true) : false), shift: () => (this.searchOpen() ? (this.findPrevious(), true) : false) },
      { key: 'Escape', run: () => (this.searchOpen() ? (this.closeSearch(), true) : false) },
    ];
  }

  private createView(parent: HTMLElement): void {
    const doc = this.value() ?? '';
    this.text = doc;
    this.detectedTabSize = detectTabSize(doc);
    parent.querySelector('.tx-code-editor__static')?.setAttribute('hidden', '');
    const extensions: Extension[] = [
      codeEditorBase(),
      this.compartments.initial({
        language: this.resolvedLanguage(),
        readOnly: this.readOnly(),
        editable: !this.isDisabled(),
        lineNumbers: this.lineNumbers(),
        wordWrap: this.wordWrap(),
        tabSize: this.tabSize() ?? this.detectedTabSize,
        placeholder: this.placeholder(),
        attributes: this.contentAttributes(),
        indentGuides: this.indentGuides(),
      }),
      Prec.highest(keymap.of(this.searchKeys())),
      keymap.of(tabKeys(() => this.escaped)),
      EditorView.domEventHandlers({
        keydown: (event) => {
          if (event.key === 'Escape') {
            this.escaped = true;
          } else if (event.key !== 'Tab' && event.key !== 'Shift') {
            this.escaped = false;
          }
          return false;
        },
        focus: (event) => {
          this.focused.emit(event);
          return false;
        },
        blur: (event) => {
          this.escaped = false;
          this.onTouched();
          this.blurred.emit(event);
          return false;
        },
      }),
      EditorView.updateListener.of((update) => this.onUpdate(update)),
    ];
    this.view = new EditorView({ parent, state: EditorState.create({ doc, extensions }) });
    this.ready.set(true);
  }

  private destroyView(): void {
    this.view?.destroy();
    this.view = null;
    this.ready.set(false);
  }

  private onUpdate(update: ViewUpdate): void {
    if (update.focusChanged) {
      this.focusedState.set(update.view.hasFocus);
    }
    if (!update.docChanged) {
      return;
    }
    this.text = update.state.doc.toString();
    this.docVersion.update((version) => version + 1);
    if (this.applyingExternal) {
      return;
    }
    this.value.set(this.text);
    this.codeChanged.emit(this.text);
    this.onChange(this.text);
  }

  private replaceDocument(value: string): void {
    const view = this.view;
    if (!view) {
      return;
    }
    this.applyingExternal = true;
    const head = Math.min(view.state.selection.main.head, value.length);
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
      selection: EditorSelection.cursor(head),
      annotations: [historyAction.of('reset'), Transaction.addToHistory.of(false)],
    });
    this.applyingExternal = false;
    if (this.tabSize() === undefined) {
      this.detectedTabSize = detectTabSize(value);
      this.reconfigure('tabSize', this.compartments.tabSizeExtension(this.detectedTabSize));
    }
  }

  private reconfigure(name: TxCodeCompartmentName, extension: Extension): void {
    this.view?.dispatch({ effects: this.compartments[name].reconfigure(extension) });
  }
}

