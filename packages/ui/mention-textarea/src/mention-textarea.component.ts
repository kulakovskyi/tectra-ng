import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectFieldInvalid } from '@tectra/core/forms';
import { TxOverlayInsets, txPositions, watchOrigin, TxOverlayAnchor, txScrollStrategy } from '@tectra/core/overlay';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraDeepPartial, TectraMentionTokens, toStyleObject } from '@tectra/themes';
import { TxAvatar } from '@tectra/ui/avatar';
import { TxOptionList, TxOptionsBase, TxSelectItem, isSelectableRow } from '@tectra/ui/select';
import { TxTextarea } from '@tectra/ui/textarea';
import { caretPoint } from './caret';
import { TxMentionItem, TxMentionTextareaPart } from './mention-textarea.types';

@Component({
  selector: 'tx-mention-textarea',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, TxOverlayAnchor, TxOptionList, TxTextarea, TxAvatar],
  templateUrl: './mention-textarea.component.html',
  styleUrl: './mention-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxMentionTextarea), multi: true }],
  host: {
    class: 'tx-mention-textarea',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-mention-textarea--open]': 'isOpen()',
  },
})
export class TxMentionTextarea extends TxOptionsBase<string> {
  readonly suggestions = input<readonly TxMentionItem[]>([]);
  readonly trigger = input<string>('@');
  readonly localSearch = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly lines = input<number>(4);
  readonly autoResize = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly placeholder = input<string>('');
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraMentionTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxMentionTextareaPart, TxMentionTextarea> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly mentionsChange = output<string[]>();
  readonly mentioned = output<TxMentionItem>();

  readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  private injector = inject(Injector);
  private overlayInsets = inject(TxOverlayInsets);
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);
  private readonly followOrigin = effect((onCleanup) => {
    if (!this.showPanel()) {
      return;
    }
    onCleanup(
      watchOrigin(this.textarea().nativeElement, this.overlayInsets, {
        insetsChange: () => this.connectedOverlay()?.overlayRef?.updatePosition(),
      }),
    );
  });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('mentionTextarea', this, this.pt, this.ptOptions);
  readonly positions = txPositions('bottom-start', 4);
  readonly scrollStrategy = txScrollStrategy(this.injector);
  protected readonly source = this.suggestions;
  protected override readonly localQuery = computed(() => (this.localSearch() ? this.query().trim() : ''));

  readonly isOpen = signal(false);
  readonly caret = signal({ top: 0, left: 0, height: 0 });
  private mentionStart = -1;
  private readonly known = signal<TxMentionItem[]>([]);
  private lastMentions = '';

  readonly text = computed(() => this.value() ?? '');
  readonly mentions = computed(() => {
    const text = this.text();
    const items = [...this.known(), ...this.suggestions()];
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.value) || !text.includes(`${this.trigger()}${item.label}`)) {
        return false;
      }
      seen.add(item.value);
      return true;
    });
  });
  readonly showPanel = computed(() => this.isOpen() && (this.rows().length > 0 || this.loading()));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-mention'), ...this.passThrough().root?.style }));

  constructor() {
    super();
    effect(() => {
      const values = this.mentions().map((item) => item.value);
      const key = values.join('\u0000');
      untracked(() => {
        if (key !== this.lastMentions) {
          this.lastMentions = key;
          this.mentionsChange.emit(values);
        }
      });
    });
  }

  onInput(): void {
    const element = this.textarea().nativeElement;
    this.updateValue(element.value);
    this.detect();
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.showPanel()) {
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      this.moveActive(event.key);
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      const active = this.rows()[this.activeIndex()];
      if (isSelectableRow(active)) {
        event.preventDefault();
        this.activate(active);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }

  onCaretMove(): void {
    if (this.isOpen()) {
      this.detect();
    }
  }

  onBlur(): void {
    this.close();
    this.markTouched();
  }

  onPanelMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  onOptionClick(item: TxSelectItem): void {
    this.activate(item);
  }

  close(): void {
    this.isOpen.set(false);
    this.mentionStart = -1;
  }

  protected isSelected(): boolean {
    return false;
  }

  protected isListActive(): boolean {
    return this.isOpen();
  }

  protected activate(item: TxSelectItem): void {
    const mention = item.option as TxMentionItem;
    const element = this.textarea().nativeElement;
    const end = element.selectionStart ?? element.value.length;
    const start = this.mentionStart;
    if (start < 0) {
      return;
    }
    const inserted = `${this.trigger()}${mention.label} `;
    element.value = element.value.slice(0, start) + inserted + element.value.slice(end);
    const caret = start + inserted.length;
    element.setSelectionRange(caret, caret);
    this.known.update((known) => [...known.filter((entry) => entry.value !== mention.value), mention]);
    this.close();
    this.updateValue(element.value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.focus();
    this.mentioned.emit(mention);
  }

  private detect(): void {
    const element = this.textarea().nativeElement;
    const caret = element.selectionStart ?? element.value.length;
    const before = element.value.slice(0, caret);
    const start = before.lastIndexOf(this.trigger());
    const query = start >= 0 ? before.slice(start + this.trigger().length) : '';
    const boundary = start === 0 || /\s/.test(before.charAt(start - 1));
    if (start < 0 || !boundary || /[\n\r]/.test(query) || query.length > 40 || this.readonly() || this.disabled()) {
      this.close();
      return;
    }
    if (/\s/.test(query) && !this.hasMatches(query)) {
      this.close();
      return;
    }
    const changed = query !== this.query() || !this.isOpen();
    this.mentionStart = start;
    this.query.set(query);
    const point = caretPoint(element, start);
    this.caret.set({ top: element.offsetTop + point.top, left: element.offsetLeft + point.left, height: point.height });
    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
    if (changed) {
      this.activeIndex.set(this.rows().findIndex(isSelectableRow));
      this.emitFilter();
    }
  }

  private hasMatches(query: string): boolean {
    const lower = query.toLowerCase();
    return this.suggestions().some((item) => item.label.toLowerCase().startsWith(lower));
  }
}
