import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, TxTranslations, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { TxOverlayAnchor, txPositions, txScrollStrategy } from '@tectra-ng/core/overlay';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TxEditorFormat, TxEditorProseStyles, formatEditorHtml, fromQuillHtml } from '@tectra-ng/editor/content';
import { TxIcon, TxIconRegistry } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraEditorTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDialog } from '@tectra-ng/ui/dialog';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMenu, TxMenuItem } from '@tectra-ng/ui/menu';
import { TxPopover } from '@tectra-ng/ui/popover';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { Node as ProseNode, Slice } from 'prosemirror-model';
import { Command, EditorState, NodeSelection, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { TxEditorToolbarEnd } from './editor.slots';
import {
  TX_EDITOR_ALIGN_ICONS,
  TX_EDITOR_FONT_SIZES,
  TX_EDITOR_HIGHLIGHT_COLORS,
  TX_EDITOR_ICONS,
  TX_EDITOR_TEXT_COLORS,
  TX_EDITOR_TOOLBARS,
  TX_EDITOR_TOOLS,
  shortcutLabel,
} from './editor.toolbar';
import {
  TxEditorAiAction,
  TxEditorAiRequest,
  TxEditorAlign,
  TxEditorColor,
  TxEditorHeadingLevel,
  TxEditorImageRejection,
  TxEditorImageUpload,
  TxEditorMentionItem,
  TxEditorMentionSource,
  TxEditorPart,
  TxEditorSelection,
  TxEditorTextChange,
  TxEditorTool,
  TxEditorToolbar,
} from './editor.types';
import { blockAttr, insertNode, linkRange, markAttrs, setBlockAttr, setBlockType, setTextStyle, toggleWrap, wrapIn } from './engine/commands';
import { toggleList } from './engine/lists';
import { canRedo, canUndo, historyKey } from './engine/history';
import { isMac } from './engine/keymap';
import { TxCalloutView, TxImageView, TxTaskItemView, TxVideoView } from './engine/node-views';
import { isEmptyDoc, parseHtml, serializeFragment, serializeHtml } from './engine/html';
import { aiKey } from './engine/ai';
import { TxSuggestionMatch, TxSuggestionTrigger, normalizeHref, selectionText, textLength } from './engine/plugins';
import { addColumn, addRow, deleteColumn, deleteRow, deleteTable, headerRowActive, insertTable, tableContext, toggleHeaderRow } from './engine/tables';
import { TX_EDITOR_EMOJI, TxEditorEmoji, matchEmoji } from './editor.emoji';
import { TX_EDITOR_SLASH_ITEMS, TxEditorSlashItem, matchSlashItems } from './editor.slash';
import { editorPlugins } from './engine/setup';
import { toVideoEmbed, txEditorSchema as schema } from './engine/schema';

export interface TxEditorSuggestionOption {
  id: string;
  label: string;
  description?: string;
  avatar?: string;
  icon?: string;
  glyph?: string;
  shortcut?: string;
  value: TxEditorMentionItem | TxEditorSlashItem | TxEditorEmoji;
}

interface TxToolView {
  tool: TxEditorTool;
  index: number;
}

interface TxAnchorBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

type TxEditorPopover = 'link' | 'textColor' | 'highlight' | 'video';

const NO_BOX: TxAnchorBox = { left: 0, top: 0, width: 0, height: 0 };

@Component({
  selector: 'tx-editor',
  imports: [NgTemplateOutlet, CdkOverlayOrigin, CdkConnectedOverlay, TxOverlayAnchor, TxIcon, TxButton, TxDialog, TxInput, TxMenu, TxPopover, TxTooltip],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxEditor), multi: true }],
  host: {
    class: 'tx-editor',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-editor--focused]': 'hasFocus()',
    '[class.tx-editor--disabled]': 'isDisabled()',
    '[class.tx-editor--readonly]': 'readonly()',
    '[class.tx-editor--invalid]': 'isInvalid()',
    '[class.tx-editor--full]': 'fullView()',
    '[style.min-height.px]': 'placeholderHeight()',
  },
})
export class TxEditor extends TxFormControlBase<string> {
  private document = inject(DOCUMENT);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private localeService = inject(TxLocaleService);

  readonly html = model<string>('');
  readonly format = input<TxEditorFormat>('html');
  readonly toolbar = input<TxEditorToolbar>('full');
  readonly headingLevels = input<readonly TxEditorHeadingLevel[] | undefined>(undefined);
  readonly placeholder = input('');
  readonly readonly = input(false, { transform: booleanAttribute });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly height = input<string | undefined>(undefined);
  readonly minHeight = input<string | undefined>(undefined);
  readonly maxHeight = input<string | undefined>(undefined);
  readonly maxLength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly showCount = input(false, { transform: booleanAttribute });
  readonly linkTarget = input<'_blank' | '_self'>('_blank');
  readonly textColors = input<readonly TxEditorColor[]>(TX_EDITOR_TEXT_COLORS);
  readonly highlightColors = input<readonly TxEditorColor[]>(TX_EDITOR_HIGHLIGHT_COLORS);
  readonly imageUpload = input<TxEditorImageUpload | undefined>(undefined);
  readonly maxImageSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly mentions = input<TxEditorMentionSource | undefined>(undefined);
  readonly mentionTrigger = input('@');
  readonly slashMenu = input(true, { transform: booleanAttribute });
  readonly emoji = input(true, { transform: booleanAttribute });
  readonly typography = input(true, { transform: booleanAttribute });
  readonly draftKey = input<string | undefined>(undefined);
  readonly selectionMenu = input(true, { transform: booleanAttribute });
  readonly ai = input(false, { transform: booleanAttribute });
  readonly aiLabel = input<string | undefined>(undefined);
  readonly aiActions = input<readonly TxEditorAiAction[]>([]);
  readonly fullView = model(false);
  readonly fullViewButton = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraEditorTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxEditorPart, TxEditor> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly textChange = output<TxEditorTextChange>();
  readonly selectionChange = output<TxEditorSelection>();
  readonly focused = output<void>();
  readonly blurred = output<void>();
  readonly ready = output<EditorView>();
  readonly aiRequested = output<string>();
  readonly aiAction = output<TxEditorAiRequest>();
  readonly imageRejected = output<TxEditorImageRejection>();
  readonly mentionSelected = output<TxEditorMentionItem>();
  readonly draftRestored = output<string>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('editor', this, this.pt, this.ptOptions);
  protected readonly toolbarEnd = contentChild(TxEditorToolbarEnd);

  private readonly mount = viewChild.required<ElementRef<HTMLElement>>('mount');
  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');
  private readonly fullHost = viewChild.required<ElementRef<HTMLElement>>('fullHost');
  private readonly toolbarElement = viewChild<ElementRef<HTMLElement>>('toolbarElement');
  private readonly imageInput = viewChild<ElementRef<HTMLInputElement>>('imageInput');
  private readonly bubbleAnchor = viewChild<ElementRef<HTMLElement>>('bubbleAnchor');
  private readonly suggestAnchor = viewChild<ElementRef<HTMLElement>>('suggestAnchor');
  private readonly popover = viewChild<TxPopover>('popover');
  private readonly blockMenuRef = viewChild<TxMenu>('blockMenuRef');
  private readonly alignMenuRef = viewChild<TxMenu>('alignMenuRef');
  private readonly sizeMenuRef = viewChild<TxMenu>('sizeMenuRef');
  private readonly aiMenuRef = viewChild<TxMenu>('aiMenuRef');
  private readonly bubbleOverlay = viewChild<CdkConnectedOverlay>('bubbleOverlay');
  private readonly suggestOverlay = viewChild<CdkConnectedOverlay>('suggestOverlay');

  protected readonly id = uniqueId('tx-editor');
  protected readonly mac = isMac();
  protected readonly version = signal(0);
  protected readonly hasFocus = signal(false);
  protected readonly pointerDown = signal(false);
  protected readonly bubbleBox = signal<TxAnchorBox>(NO_BOX);
  protected readonly suggestBox = signal<TxAnchorBox>(NO_BOX);
  protected readonly suggestion = signal<TxSuggestionMatch | null>(null);
  protected readonly suggestionItems = signal<readonly TxEditorSuggestionOption[]>([]);
  protected readonly suggestionIndex = signal(0);
  protected readonly popoverKind = signal<TxEditorPopover | null>(null);
  protected readonly popoverOpen = signal(false);
  protected readonly linkDraft = signal('');
  protected readonly videoDraft = signal('');
  protected readonly focusIndex = signal(0);
  protected readonly placeholderHeight = signal<number | null>(null);
  protected readonly bubbleTools: readonly TxEditorTool[] = ['bold', 'italic', 'underline', 'strike', 'code'];
  protected readonly scrollStrategy = txScrollStrategy(inject(Injector));
  private readonly abovePositions: ConnectedPosition[] = txPositions('top', 8);
  private readonly belowPositions: ConnectedPosition[] = txPositions('bottom', 8);
  protected readonly bubblePositions = computed(() => {
    const state = this.state();
    return state?.table && state.empty && !state.link && !state.ai?.done ? this.belowPositions : this.abovePositions;
  });
  protected readonly suggestPositions: ConnectedPosition[] = txPositions('bottom-start', 6);

  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly editable = computed(() => !this.isDisabled() && !this.readonly());

  protected readonly groups = computed<TxToolView[][]>(() => {
    const toolbar = this.toolbar();
    const groups = toolbar === 'none' ? [] : typeof toolbar === 'string' ? TX_EDITOR_TOOLBARS[toolbar] : toolbar;
    let index = 0;
    return groups.map((group) => group.map((tool) => ({ tool, index: index++ }))).filter((group) => group.length);
  });
  protected readonly toolCount = computed(() => this.groups().reduce((sum, group) => sum + group.length, 0) + (this.ai() ? 1 : 0) + (this.showFullViewButton() ? 1 : 0));
  protected readonly showFullViewButton = computed(() => this.fullViewButton() ?? this.toolbar() === 'full');
  protected readonly levels = computed<readonly TxEditorHeadingLevel[]>(() => this.headingLevels() ?? (this.toolbar() === 'full' ? [1, 2, 3, 4, 5, 6] : [1, 2]));

  protected readonly state = computed(() => {
    this.version();
    const view = this.view;
    if (!view) {
      return null;
    }
    const editorState = view.state;
    const active = Object.fromEntries(
      (Object.keys(TX_EDITOR_TOOLS) as TxEditorTool[]).map((tool) => [tool, !!TX_EDITOR_TOOLS[tool].active?.(editorState)]),
    ) as Record<TxEditorTool, boolean>;
    const parent = editorState.selection.$from.parent;
    const textStyle = markAttrs(editorState, schema.marks['text_style']);
    return {
      active,
      canUndo: canUndo(editorState),
      canRedo: canRedo(editorState),
      block: parent.type.name === 'heading' ? (Number(parent.attrs['level']) as TxEditorHeadingLevel) : 0,
      align: ((blockAttr(editorState, 'align') as TxEditorAlign | null) ?? 'left') as TxEditorAlign,
      color: (textStyle?.['color'] as string | null) ?? null,
      background: (textStyle?.['background'] as string | null) ?? null,
      fontSize: (textStyle?.['fontSize'] as string | null) ?? null,
      inCode: !!parent.type.spec.code,
      table: !!tableContext(editorState),
      ai: aiKey.getState(editorState),
      headerRow: headerRowActive(editorState),
      empty: editorState.selection.empty,
      link: linkRange(editorState),
      count: textLength(editorState.doc),
    };
  });

  protected readonly blockLabel = computed(() => {
    const block = this.state()?.block ?? 0;
    const t = this.translations();
    return block ? t.editorHeading.replace('{level}', String(block)) : t.editorParagraph;
  });
  protected readonly blockMenu = computed<TxMenuItem[]>(() => {
    const t = this.translations();
    const current = this.state()?.block ?? 0;
    return [
      { label: t.editorParagraph, icon: current === 0 ? 'check' : undefined, shortcut: shortcutLabel('Mod+Alt+0', this.mac), command: () => this.run(setBlockType(schema.nodes['paragraph'])) },
      ...this.levels().map((level) => ({
        label: t.editorHeading.replace('{level}', String(level)),
        icon: current === level ? 'check' : undefined,
        shortcut: shortcutLabel(`Mod+Alt+${level}`, this.mac),
        command: () => this.run(setBlockType(schema.nodes['heading'], { level })),
      })),
    ];
  });
  protected readonly alignMenu = computed<TxMenuItem[]>(() => {
    const t = this.translations();
    const labels: Record<TxEditorAlign, keyof TxTranslations> = { left: 'editorAlignLeft', center: 'editorAlignCenter', right: 'editorAlignRight', justify: 'editorAlignJustify' };
    return (Object.keys(labels) as TxEditorAlign[]).map((align) => ({
      label: t[labels[align]],
      icon: TX_EDITOR_ALIGN_ICONS[align],
      command: () => this.run(setBlockAttr('align', align === 'left' ? null : align)),
    }));
  });
  protected readonly aiMenu = computed<TxMenuItem[]>(() =>
    this.aiActions().map((action) => ({ label: action.label, icon: action.icon ?? 'sparkles', command: () => this.requestAiAction(action) })),
  );
  protected readonly sizeMenu = computed<TxMenuItem[]>(() => {
    const t = this.translations();
    const current = this.state()?.fontSize ?? null;
    return TX_EDITOR_FONT_SIZES.map((size) => ({
      label: t[size.label],
      icon: current === size.value ? 'check' : undefined,
      command: () => this.run(setTextStyle('fontSize', size.value)),
    }));
  });
  protected readonly countLabel = computed(() => {
    const count = this.state()?.count ?? 0;
    const limit = this.maxLength();
    const t = this.translations();
    return limit ? t.editorCountLimit.replace('{count}', String(count)).replace('{limit}', String(limit)) : t.editorCount.replace('{count}', String(count));
  });
  protected readonly showBubble = computed(() => {
    const state = this.state();
    return (
      this.selectionMenu() &&
      this.editable() &&
      (this.hasFocus() || !!this.state()?.ai?.done) &&
      !this.pointerDown() &&
      !this.popoverOpen() &&
      !this.suggestion() &&
      !!state &&
      !state.inCode &&
      (!state.empty || !!state.link || state.table || !!state.ai?.done)
    );
  });
  protected readonly activeSuggestion = computed(() => this.suggestionItems()[this.suggestionIndex()] ?? null);
  protected readonly showSuggestions = computed(() => {
    const match = this.suggestion();
    return !!match && (match.kind === 'mention' || this.suggestionItems().length > 0);
  });
  protected readonly suggestionLabel = computed(() => {
    const kind = this.suggestion()?.kind;
    const t = this.translations();
    return kind === 'slash' ? t.editorCommands : kind === 'emoji' ? t.editorEmoji : t.editorMentions;
  });
  private readonly triggers = computed<TxSuggestionTrigger[]>(() => [
    ...(this.mentions() ? [{ kind: 'mention' as const, char: this.mentionTrigger(), minLength: 0 }] : []),
    ...(this.slashMenu() ? [{ kind: 'slash' as const, char: '/', minLength: 0 }] : []),
    ...(this.emoji() ? [{ kind: 'emoji' as const, char: ':', minLength: 2 }] : []),
  ]);
  protected readonly contentStyle = computed(() => ({
    height: this.fullView() ? null : this.height() ?? null,
    minHeight: this.minHeight() ?? null,
    maxHeight: this.fullView() ? null : this.maxHeight() ?? null,
  }));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-editor'), ...this.passThrough().root?.style }));

  private view: EditorView | null = null;
  private lastValue = '';
  private suggestionRequest = 0;
  private popoverRange: { from: number; to: number } | null = null;
  private frameMarker: Comment | null = null;
  private aiOriginal: Slice | null = null;
  private draftTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    inject(TxStyleLoader).load(TxEditorProseStyles);
    inject(TxIconRegistry).register(TX_EDITOR_ICONS);
    afterNextRender(() => this.createView());
    effect(() => {
      const html = this.html();
      untracked(() => this.applyExternal(html));
    });
    effect(() => {
      this.editable();
      this.placeholder();
      untracked(() => this.view?.setProps({ editable: () => this.editable() }));
      untracked(() => this.view?.dispatch(this.view.state.tr.setMeta('txRefresh', true)));
    });
    effect(() => {
      const box = this.bubbleBox();
      untracked(() => box && this.bubbleOverlay()?.overlayRef?.updatePosition());
    });
    effect(() => {
      const box = this.suggestBox();
      untracked(() => box && this.suggestOverlay()?.overlayRef?.updatePosition());
    });
    effect(() => {
      if (this.fullView()) {
        untracked(() => this.mountFullView());
      }
    });
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.draftTimer);
      this.unmountFullView();
      this.view?.destroy();
    });
  }

  override writeValue(value: string | null): void {
    super.writeValue(value);
    this.html.set(value ?? '');
  }

  focus(): void {
    this.view?.focus();
  }

  clear(): void {
    this.setContent('');
    this.emitValue();
  }

  getHtml(): string {
    return this.lastValue;
  }

  getText(): string {
    const view = this.view;
    return view ? view.state.doc.textBetween(0, view.state.doc.content.size, '\n', '￼') : '';
  }

  insertHtml(html: string): void {
    const view = this.view;
    if (!view) {
      return;
    }
    const slice = parseHtml(html, this.document).content;
    view.dispatch(view.state.tr.replaceSelection(new Slice(slice, 0, 0)).scrollIntoView());
  }

  get editorView(): EditorView | null {
    return this.view;
  }

  protected toolLabel(tool: TxEditorTool): string {
    const spec = TX_EDITOR_TOOLS[tool];
    const label = this.translations()[spec.label];
    return spec.shortcut ? `${label} (${shortcutLabel(spec.shortcut, this.mac)})` : label;
  }

  protected toolName(tool: TxEditorTool): string {
    return this.translations()[TX_EDITOR_TOOLS[tool].label];
  }

  protected toolIcon(tool: TxEditorTool): string {
    if (tool === 'align') {
      return TX_EDITOR_ALIGN_ICONS[this.state()?.align ?? 'left'];
    }
    return TX_EDITOR_TOOLS[tool].icon;
  }

  protected toolDisabled(tool: TxEditorTool): boolean {
    const state = this.state();
    if (!this.editable() || !state) {
      return true;
    }
    if (tool === 'undo') {
      return !state.canUndo;
    }
    if (tool === 'redo') {
      return !state.canRedo;
    }
    const view = this.view;
    const command = TX_EDITOR_TOOLS[tool].command;
    if (state.inCode && !['undo', 'redo', 'codeBlock', 'blockStyle', 'bulletList', 'orderedList', 'taskList', 'blockquote', 'clearFormatting', 'image', 'horizontalRule'].includes(tool)) {
      return true;
    }
    return !!command && !!view && !command(view.state, undefined, view) && !state.active[tool];
  }

  protected onToolClick(event: MouseEvent, tool: TxEditorTool, index: number): void {
    this.focusIndex.set(index);
    const target = event.currentTarget as HTMLElement;
    switch (tool) {
      case 'blockStyle':
        this.blockMenuRef()?.toggle(target);
        return;
      case 'align':
        this.alignMenuRef()?.toggle(target);
        return;
      case 'fontSize':
        this.sizeMenuRef()?.toggle(target);
        return;
      case 'link':
        this.openLink(target);
        return;
      case 'textColor':
      case 'highlight':
      case 'video':
        this.openPopover(tool, target);
        return;
      case 'image':
        this.imageInput()?.nativeElement.click();
        return;
    }
    const command = TX_EDITOR_TOOLS[tool].command;
    if (command) {
      this.run(command);
    }
  }

  protected onToolbarKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) {
      return;
    }
    const buttons = Array.from(this.toolbarElement()?.nativeElement.querySelectorAll<HTMLButtonElement>('[data-tool]') ?? []);
    if (!buttons.length) {
      return;
    }
    event.preventDefault();
    const current = buttons.indexOf(event.target as HTMLButtonElement);
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    this.focusIndex.set(next);
    buttons[next].focus();
  }

  protected toggleFullView(): void {
    this.fullView.update((value) => !value);
  }

  protected requestAi(): void {
    this.aiRequested.emit(this.lastValue);
  }

  protected unmountFullView(): void {
    const frame = this.frame().nativeElement;
    const marker = this.frameMarker;
    if (marker?.parentNode && frame.parentNode !== marker.parentNode) {
      marker.parentNode.insertBefore(frame, marker);
    }
    this.placeholderHeight.set(null);
    if (this.view && !this.fullView()) {
      queueMicrotask(() => this.view?.focus());
    }
  }

  protected onFullViewOpened(): void {
    this.view?.focus();
  }

  private mountFullView(): void {
    const frame = this.frame().nativeElement;
    const host = this.fullHost().nativeElement;
    if (frame.parentNode === host) {
      return;
    }
    this.placeholderHeight.set(frame.offsetHeight);
    if (!this.frameMarker) {
      this.frameMarker = this.document.createComment('tx-editor-frame');
      frame.parentNode?.insertBefore(this.frameMarker, frame);
    }
    host.appendChild(frame);
  }

  protected openLink(target?: Element | null): void {
    const view = this.view;
    if (!view || !this.editable()) {
      return;
    }
    const link = linkRange(view.state);
    const { from, to } = view.state.selection;
    this.popoverRange = link ? { from: link.from, to: link.to } : { from, to };
    this.linkDraft.set(link?.href ?? '');
    this.openPopover('link', target ?? this.bubbleAnchor()?.nativeElement ?? null);
  }

  protected applyLink(): void {
    const view = this.view;
    const range = this.popoverRange;
    const value = this.linkDraft().trim();
    this.closePopover();
    if (!view || !range) {
      return;
    }
    const type = schema.marks['link'];
    const tr = view.state.tr;
    if (!value) {
      tr.removeMark(range.from, range.to, type);
    } else {
      const href = normalizeHref(value);
      const mark = type.create({ href, target: this.linkTarget() === '_blank' ? '_blank' : null });
      if (range.from === range.to) {
        tr.insertText(value, range.from).addMark(range.from, range.from + value.length, mark);
        tr.setSelection(TextSelection.create(tr.doc, range.from + value.length));
      } else {
        tr.removeMark(range.from, range.to, type).addMark(range.from, range.to, mark);
      }
    }
    view.dispatch(tr.scrollIntoView());
    view.focus();
  }

  protected removeLink(): void {
    const view = this.view;
    const link = view ? linkRange(view.state) : null;
    const range = this.popoverOpen() && this.popoverKind() === 'link' ? this.popoverRange : link;
    this.closePopover();
    if (view && range) {
      view.dispatch(view.state.tr.removeMark(range.from, range.to, schema.marks['link']));
      view.focus();
    }
  }

  protected openCurrentLink(): void {
    const href = this.state()?.link?.href;
    if (href) {
      this.document.defaultView?.open(href, '_blank', 'noopener,noreferrer');
    }
  }

  protected applyColor(kind: 'textColor' | 'highlight', value: string | null): void {
    this.closePopover();
    this.run(setTextStyle(kind === 'textColor' ? 'color' : 'background', value));
  }

  protected applyVideo(): void {
    const embed = toVideoEmbed(this.videoDraft());
    this.closePopover();
    if (embed) {
      this.run(insertNode(schema.nodes['video'].create({ src: embed })));
    }
    this.videoDraft.set('');
  }

  protected closePopover(): void {
    this.popover()?.hide();
  }

  protected onPopoverClosed(): void {
    this.popoverOpen.set(false);
  }

  protected onImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    files.forEach((file) => void this.insertImage(file));
  }

  protected pickSuggestion(option: TxEditorSuggestionOption): void {
    const view = this.view;
    const match = this.suggestion();
    if (!view || !match) {
      return;
    }
    if (match.kind === 'mention') {
      const item = option.value as TxEditorMentionItem;
      const node = schema.nodes['mention'].create({ id: item.id, label: item.label });
      const tr = view.state.tr.replaceWith(match.from, match.to, node);
      tr.insertText(' ', match.from + node.nodeSize);
      tr.setSelection(TextSelection.create(tr.doc, match.from + node.nodeSize + 1));
      view.dispatch(tr.scrollIntoView());
      view.focus();
      this.mentionSelected.emit(item);
      return;
    }
    if (match.kind === 'emoji') {
      view.dispatch(view.state.tr.insertText((option.value as TxEditorEmoji).char, match.from, match.to).scrollIntoView());
      view.focus();
      return;
    }
    view.dispatch(view.state.tr.delete(match.from, match.to));
    this.runSlash(option.value as TxEditorSlashItem);
  }

  protected openAiMenu(event: MouseEvent): void {
    this.aiMenuRef()?.toggle(event.currentTarget as Element);
  }

  protected keepAi(): void {
    const view = this.view;
    if (view) {
      view.dispatch(view.state.tr.setMeta(aiKey, null));
      view.focus();
    }
    this.aiOriginal = null;
  }

  protected discardAi(): void {
    const view = this.view;
    const range = view ? aiKey.getState(view.state) : null;
    if (view && range && this.aiOriginal) {
      view.dispatch(view.state.tr.replaceRange(range.from, range.to, this.aiOriginal).setMeta(aiKey, null).scrollIntoView());
      view.focus();
    }
    this.aiOriginal = null;
  }

  private requestAiAction(action: TxEditorAiAction): void {
    const view = this.view;
    if (!view) {
      return;
    }
    const { from, to, empty } = view.state.selection;
    if (empty) {
      return;
    }
    const slice = view.state.doc.slice(from, to);
    this.aiOriginal = slice;
    view.dispatch(view.state.tr.setMeta(aiKey, { from, to, done: false }));
    this.aiAction.emit({
      action,
      text: view.state.doc.textBetween(from, to, '\n', '\ufffc'),
      html: serializeFragment(slice.content, this.document),
      replace: (content) => this.replaceAi(content),
    });
  }

  private async replaceAi(content: string | AsyncIterable<string>): Promise<void> {
    const view = this.view;
    if (!view || !aiKey.getState(view.state)) {
      return;
    }
    if (typeof content === 'string') {
      this.writeAi(content, true);
      return;
    }
    let text = '';
    for await (const chunk of content) {
      text += chunk;
      this.writeAi(text, false);
    }
    this.writeAi(text, true);
  }

  private writeAi(content: string, done: boolean): void {
    const view = this.view;
    const range = view ? aiKey.getState(view.state) : null;
    if (!view || !range) {
      return;
    }
    const tr = view.state.tr;
    if (done && /^\s*</.test(content)) {
      const doc = parseHtml(content, this.document);
      tr.replaceRange(range.from, range.to, new Slice(doc.content, doc.childCount === 1 ? 1 : 0, doc.childCount === 1 ? 1 : 0));
    } else {
      tr.insertText(done ? content : content.replace(/\s+$/, ''), range.from, range.to);
    }
    const end = tr.mapping.map(range.to, 1);
    tr.setMeta(aiKey, { from: range.from, to: Math.max(range.from, end), done });
    tr.setSelection(TextSelection.create(tr.doc, Math.max(range.from, end)));
    view.dispatch(tr.scrollIntoView());
    if (done) {
      view.focus();
    }
  }

  protected tableAction(action: 'rowAbove' | 'rowBelow' | 'columnLeft' | 'columnRight' | 'deleteRow' | 'deleteColumn' | 'header' | 'delete'): void {
    const commands: Record<typeof action, Command> = {
      rowAbove: addRow(false),
      rowBelow: addRow(true),
      columnLeft: addColumn(false),
      columnRight: addColumn(true),
      deleteRow,
      deleteColumn,
      header: toggleHeaderRow,
      delete: deleteTable,
    };
    this.run(commands[action]);
  }

  private runSlash(item: TxEditorSlashItem): void {
    const { nodes } = schema;
    const commands: Partial<Record<TxEditorSlashItem['id'], Command>> = {
      paragraph: setBlockType(nodes['paragraph']),
      heading1: setBlockType(nodes['heading'], { level: 1 }),
      heading2: setBlockType(nodes['heading'], { level: 2 }),
      heading3: setBlockType(nodes['heading'], { level: 3 }),
      bulletList: toggleList(nodes['bullet_list']),
      orderedList: toggleList(nodes['ordered_list']),
      taskList: toggleList(nodes['task_list']),
      blockquote: toggleWrap(nodes['blockquote']),
      codeBlock: setBlockType(nodes['code_block']),
      callout: wrapIn(nodes['callout'], { tone: 'info' }),
      table: insertTable,
      divider: insertNode(nodes['horizontal_rule'].create()),
    };
    if (item.id === 'image') {
      this.imageInput()?.nativeElement.click();
      return;
    }
    if (item.id === 'video') {
      this.openPopover('video', this.suggestAnchor()?.nativeElement ?? null);
      return;
    }
    const command = commands[item.id];
    if (command) {
      this.run(command);
    }
  }

  protected colorLabel(color: TxEditorColor): string {
    const translations = this.translations() as unknown as Record<string, string>;
    return translations[color.label] ?? color.label;
  }

  protected initials(label: string): string {
    return label
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  protected isMenuTool(tool: TxEditorTool): boolean {
    return tool === 'blockStyle' || tool === 'align' || tool === 'fontSize';
  }

  protected isPopoverTool(tool: TxEditorTool): boolean {
    return tool === 'link' || tool === 'textColor' || tool === 'highlight' || tool === 'video';
  }

  protected isToggleTool(tool: TxEditorTool): boolean {
    return !!TX_EDITOR_TOOLS[tool].active && !this.isPopoverTool(tool);
  }

  protected popoverLabel(): string {
    const kind = this.popoverKind();
    const t = this.translations();
    return kind === 'link' ? t.editorLink : kind === 'video' ? t.editorVideo : kind === 'highlight' ? t.editorHighlight : t.editorTextColor;
  }

  protected optionId(index: number): string {
    return `${this.id}-mention-${index}`;
  }

  protected run(command: Command): void {
    const view = this.view;
    if (!view || !this.editable()) {
      return;
    }
    command(view.state, view.dispatch, view);
    view.focus();
  }

  protected keepFocus(event: MouseEvent): void {
    event.preventDefault();
  }

  private openPopover(kind: TxEditorPopover, target: Element | null): void {
    const view = this.view;
    if (view && kind !== 'link') {
      const { from, to } = view.state.selection;
      this.popoverRange = { from, to };
    }
    this.popoverKind.set(kind);
    this.popoverOpen.set(true);
    afterNextRender(() => this.popover()?.show(target), { injector: this.injector });
  }

  private createView(): void {
    const host = this.mount().nativeElement;
    const state = EditorState.create({
      schema,
      doc: parseHtml(this.html(), this.document),
      plugins: editorPlugins({
        placeholder: () => this.placeholder(),
        maxLength: () => this.maxLength(),
        linkTarget: () => (this.linkTarget() === '_blank' ? '_blank' : null),
        triggers: () => this.triggers(),
        suggestion: {
          change: (match, view) => this.onSuggestion(match, view),
          keydown: (event) => this.onSuggestionKey(event),
        },
        openLink: () => this.openLink(),
        typography: {
          enabled: () => this.typography(),
          quotes: () => (this.localeService.locale().code === 'ua' ? ['«', '»', '„', '“'] : ['“', '”', '‘', '’']),
        },
      }),
    });
    this.view = new EditorView(host, {
      state,
      editable: () => this.editable(),
      attributes: () => ({
        class: 'tx-editor__prose tx-editor-prose',
        role: 'textbox',
        'aria-multiline': 'true',
        ...(this.ariaLabelledBy() ? { 'aria-labelledby': this.ariaLabelledBy() ?? '' } : { 'aria-label': this.ariaLabel() ?? this.translations().editorLabel }),
        'aria-readonly': String(this.readonly()),
        'aria-disabled': String(this.isDisabled()),
        'aria-invalid': String(this.isInvalid()),
        id: `${this.id}-content`,
      }),
      nodeViews: {
        task_item: (node, view, getPos) => new TxTaskItemView(node, view, getPos, () => this.translations().editorTaskList),
        video: (node, view, getPos) => new TxVideoView(node, view, getPos),
        callout: (node, view, getPos) => new TxCalloutView(node, view, getPos, () => this.translations().editorCalloutTone),
        image: (node, view, getPos) => new TxImageView(node, view, getPos),
      },
      transformPastedHTML: (html) => fromQuillHtml(html),
      handlePaste: (view, event) => this.handleFiles(Array.from(event.clipboardData?.files ?? []), null) || this.pasteLink(view, event),
      handleDrop: (view, event) => {
        const files = Array.from((event as DragEvent).dataTransfer?.files ?? []);
        if (!files.some((file) => file.type.startsWith('image/'))) {
          return false;
        }
        const position = view.posAtCoords({ left: (event as DragEvent).clientX, top: (event as DragEvent).clientY });
        return this.handleFiles(files, position?.pos ?? null);
      },
      handleDOMEvents: {
        focus: () => {
          this.hasFocus.set(true);
          this.focused.emit();
          this.refreshBubble();
          return false;
        },
        blur: (_view, event) => {
          const next = (event as FocusEvent).relatedTarget as Node | null;
          if (next && this.host.nativeElement.contains(next) && this.toolbarElement()?.nativeElement.contains(next)) {
            return false;
          }
          this.hasFocus.set(false);
          this.blurred.emit();
          this.markTouched();
          return false;
        },
        mousedown: () => {
          this.pointerDown.set(true);
          const up = () => {
            this.pointerDown.set(false);
            this.refreshBubble();
            this.document.removeEventListener('mouseup', up);
          };
          this.document.addEventListener('mouseup', up);
          return false;
        },
      },
      dispatchTransaction: (tr) => this.onTransaction(tr),
    });
    this.lastValue = this.serialize(this.view.state.doc);
    this.version.update((value) => value + 1);
    this.restoreDraft();
    this.ready.emit(this.view);
  }

  private onTransaction(tr: Transaction): void {
    const view = this.view;
    if (!view) {
      return;
    }
    const next = view.state.apply(tr);
    view.updateState(next);
    this.version.update((value) => value + 1);
    if (tr.docChanged && tr.getMeta('addToHistory') !== false) {
      this.emitValue();
    }
    if (tr.selectionSet || tr.docChanged) {
      const { from, to, empty } = next.selection;
      this.selectionChange.emit({ from, to, empty, text: selectionText(next) });
    }
    this.refreshBubble();
  }

  private emitValue(force = false): void {
    const view = this.view;
    if (!view) {
      return;
    }
    const value = this.serialize(view.state.doc);
    if (value === this.lastValue && !force) {
      return;
    }
    this.saveDraft(value);
    this.lastValue = value;
    this.html.set(value);
    this.updateValue(value);
    this.textChange.emit({ html: value, text: this.getText() });
  }

  private serialize(doc: ProseNode): string {
    return formatEditorHtml(serializeHtml(doc, this.document), this.format());
  }

  private applyExternal(html: string): void {
    if (!this.view || (html ?? '') === this.lastValue) {
      return;
    }
    this.setContent(html);
  }

  private setContent(html: string): void {
    const view = this.view;
    if (!view) {
      return;
    }
    const doc = parseHtml(html, this.document);
    const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content).setMeta('addToHistory', false).setMeta(historyKey, 'reset');
    tr.setSelection(TextSelection.atStart(tr.doc));
    view.dispatch(tr);
    this.lastValue = isEmptyDoc(doc) && !html ? '' : this.serialize(view.state.doc);
  }

  private refreshBubble(): void {
    const view = this.view;
    if (!view) {
      return;
    }
    const { from, to } = view.state.selection;
    if (view.state.selection instanceof NodeSelection) {
      this.bubbleBox.set(NO_BOX);
      return;
    }
    const ai = aiKey.getState(view.state);
    if (ai?.done) {
      try {
        const start = view.coordsAtPos(ai.from);
        const end = view.coordsAtPos(ai.to);
        const frameBox = this.frame().nativeElement.getBoundingClientRect();
        this.bubbleBox.set({ left: Math.min(start.left, end.left) - frameBox.left, top: start.top - frameBox.top, width: Math.max(1, Math.abs(end.right - start.left)), height: Math.max(1, end.bottom - start.top) });
      } catch {
        this.bubbleBox.set(NO_BOX);
      }
      return;
    }
    const table = view.state.selection.empty && !linkRange(view.state) ? tableContext(view.state) : null;
    if (table) {
      const element = view.nodeDOM(table.pos) as HTMLElement | null;
      const box = element?.getBoundingClientRect();
      const frameBox = this.frame().nativeElement.getBoundingClientRect();
      this.bubbleBox.set(box ? { left: box.left - frameBox.left, top: box.bottom - frameBox.top, width: box.width, height: 1 } : NO_BOX);
      return;
    }
    try {
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      const hostBox = this.frame().nativeElement.getBoundingClientRect();
      const left = Math.min(start.left, end.left);
      const right = Math.max(start.right, end.right);
      this.bubbleBox.set({
        left: left - hostBox.left,
        top: Math.min(start.top, end.top) - hostBox.top,
        width: Math.max(1, start.top === end.top ? right - left : 1),
        height: Math.max(1, end.bottom - start.top),
      });
    } catch {
      this.bubbleBox.set(NO_BOX);
    }
  }

  private onSuggestion(match: TxSuggestionMatch | null, view: EditorView): void {
    const previous = this.suggestion();
    if (!match) {
      if (previous) {
        this.suggestion.set(null);
        this.suggestionItems.set([]);
        view.dom.removeAttribute('aria-activedescendant');
        view.dom.removeAttribute('aria-controls');
      }
      return;
    }
    const changed = !previous || previous.kind !== match.kind || previous.from !== match.from || previous.query !== match.query;
    this.suggestion.set(match);
    try {
      const coords = view.coordsAtPos(match.from);
      const hostBox = this.frame().nativeElement.getBoundingClientRect();
      this.suggestBox.set({ left: coords.left - hostBox.left, top: coords.top - hostBox.top, width: 1, height: coords.bottom - coords.top });
    } catch {
      this.suggestBox.set(NO_BOX);
    }
    if (changed) {
      void this.loadSuggestions(match);
    }
  }

  private async loadSuggestions(match: TxSuggestionMatch): Promise<void> {
    const request = ++this.suggestionRequest;
    const t = this.translations();
    let options: TxEditorSuggestionOption[] = [];
    if (match.kind === 'mention') {
      const source = this.mentions();
      const items = source ? await source(match.query) : [];
      options = items.slice(0, 50).map((item) => ({ id: item.id, label: item.label, description: item.description, avatar: item.avatar, value: item }));
    } else if (match.kind === 'slash') {
      const label = (item: TxEditorSlashItem) => t[item.label].replace('{level}', String(item.level ?? ''));
      options = matchSlashItems(TX_EDITOR_SLASH_ITEMS, match.query, label).map((item) => ({
        id: item.id,
        label: label(item),
        icon: item.icon,
        shortcut: item.shortcut ? shortcutLabel(item.shortcut, this.mac) : undefined,
        value: item,
      }));
    } else {
      options = (match.query ? matchEmoji(match.query) : TX_EDITOR_EMOJI.slice(0, 8)).map((emoji) => ({ id: emoji.name, label: `:${emoji.name}:`, glyph: emoji.char, value: emoji }));
    }
    if (request !== this.suggestionRequest) {
      return;
    }
    this.suggestionItems.set(options);
    this.suggestionIndex.set(0);
    this.syncActiveDescendant();
  }

  private onSuggestionKey(event: KeyboardEvent): boolean {
    const items = this.suggestionItems();
    const kind = this.suggestion()?.kind;
    if (!items.length) {
      return kind === 'mention' && (event.key === 'ArrowDown' || event.key === 'ArrowUp');
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.suggestionIndex.update((index) => (index + step + items.length) % items.length);
      this.syncActiveDescendant();
      return true;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      const item = this.activeSuggestion();
      if (item) {
        this.pickSuggestion(item);
      }
      return true;
    }
    return false;
  }

  private syncActiveDescendant(): void {
    const dom = this.view?.dom;
    if (!dom) {
      return;
    }
    if (this.suggestionItems().length) {
      dom.setAttribute('aria-controls', `${this.id}-suggestions`);
      dom.setAttribute('aria-activedescendant', this.optionId(this.suggestionIndex()));
    } else {
      dom.removeAttribute('aria-activedescendant');
    }
  }

  private pasteLink(view: EditorView, event: ClipboardEvent): boolean {
    const text = event.clipboardData?.getData('text/plain').trim() ?? '';
    const { from, to, empty, $from } = view.state.selection;
    if (empty || $from.parent.type.spec.code || !/^(https?:\/\/|www\.|mailto:)\S+$/i.test(text)) {
      return false;
    }
    const mark = schema.marks['link'].create({ href: normalizeHref(text), target: this.linkTarget() === '_blank' ? '_blank' : null });
    view.dispatch(view.state.tr.removeMark(from, to, schema.marks['link']).addMark(from, to, mark).scrollIntoView());
    return true;
  }

  clearDraft(): void {
    clearTimeout(this.draftTimer);
    const key = this.draftKey();
    if (key) {
      this.storage()?.removeItem(key);
    }
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private saveDraft(html: string): void {
    const key = this.draftKey();
    if (!key) {
      return;
    }
    clearTimeout(this.draftTimer);
    this.draftTimer = setTimeout(() => {
      try {
        if (html) {
          this.storage()?.setItem(key, html);
        } else {
          this.storage()?.removeItem(key);
        }
      } catch {
        return;
      }
    }, 400);
  }

  private restoreDraft(): void {
    const key = this.draftKey();
    const draft = key ? this.storage()?.getItem(key) : null;
    if (!draft || this.lastValue) {
      return;
    }
    this.setContent(draft);
    this.emitValue(true);
    this.draftRestored.emit(draft);
  }

  private handleFiles(files: File[], position: number | null): boolean {
    const images = files.filter((file) => file.type.startsWith('image/'));
    if (!images.length || !this.editable()) {
      return false;
    }
    images.forEach((file) => void this.insertImage(file, position));
    return true;
  }

  private async insertImage(file: File, position: number | null = null): Promise<void> {
    const t = this.translations();
    if (!file.type.startsWith('image/')) {
      this.imageRejected.emit({ file, reason: 'type', message: file.name });
      return;
    }
    const max = this.maxImageSize();
    if (max && file.size > max) {
      const size = max >= 1024 * 1024 ? `${Math.round((max / 1024 / 1024) * 10) / 10} MB` : `${Math.round(max / 1024)} KB`;
      this.imageRejected.emit({ file, reason: 'size', message: t.editorImageTooLarge.replace('{name}', file.name).replace('{size}', size) });
      return;
    }
    const upload = this.imageUpload();
    const src = upload ? await upload(file) : await this.readAsDataUrl(file);
    const view = this.view;
    if (!view || !src) {
      return;
    }
    const node = schema.nodes['image'].create({ src, alt: file.name.replace(/\.[^.]+$/, '') });
    if (position !== null) {
      const $pos = view.state.doc.resolve(Math.min(position, view.state.doc.content.size));
      const insertAt = $pos.depth > 0 ? $pos.after(1) : $pos.pos;
      view.dispatch(view.state.tr.insert(insertAt, node).scrollIntoView());
    } else {
      insertNode(node)(view.state, view.dispatch, view);
    }
    view.focus();
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

}
