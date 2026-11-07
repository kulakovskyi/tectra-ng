import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, booleanAttribute, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraEditorContentTokens, toStyleObject } from '@tectra-ng/themes';
import { TxDialog } from '@tectra-ng/ui/dialog';
import { TxEditorContentPart, TxEditorImageClickEvent } from './editor-content.types';
import { fromQuillHtml } from './editor-html';
import { TxEditorProseStyles } from './editor-prose-styles.component';
import { sanitizeEditorHtml } from './editor-sanitizer';

@Component({
  selector: 'tx-editor-content',
  imports: [TxDialog],
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -- clicks and keys come from the images inside, which get a tab stop -->
    <div
      #body
      class="tx-editor-content__body"
      [class.tx-editor-prose]="!isUnstyled()"
      [class]="passThrough().body?.class"
      [style]="passThrough().body?.style"
      [innerHTML]="safeHtml()"
      (click)="onClick($event)"
      (keydown)="onKeydown($event)"
    ></div>
    @if (previewImages()) {
      <tx-dialog
        size="large"
        [header]="preview()?.alt || translations().editorImagePreview"
        [visible]="previewOpen()"
        (visibleChange)="previewOpen.set($event)"
      >
        @if (preview(); as image) {
          <img class="tx-editor-content__preview" [src]="image.src" [alt]="image.alt" />
        }
      </tx-dialog>
    }
  `,
  styleUrl: './editor-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-editor-content',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-editor-content--zoom]': 'previewImages()',
  },
})
export class TxEditorContent {
  private sanitizer = inject(DomSanitizer);

  readonly html = input<string | null | undefined>(null);
  readonly previewImages = input(true, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraEditorContentTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxEditorContentPart, TxEditorContent> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly imageClick = output<TxEditorImageClickEvent>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('editorContent', this, this.pt, this.ptOptions);
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');
  protected readonly preview = signal<{ src: string; alt: string } | null>(null);
  protected readonly previewOpen = signal(false);
  protected readonly safeHtml = computed(() => this.sanitizer.bypassSecurityTrustHtml(sanitizeEditorHtml(fromQuillHtml(this.html()))));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-editor-content'), ...this.passThrough().root?.style }));

  constructor() {
    inject(TxStyleLoader).load(TxEditorProseStyles);
    afterRenderEffect(() => {
      this.safeHtml();
      const preview = this.previewImages();
      this.body()
        ?.nativeElement.querySelectorAll('img')
        .forEach((image) => {
          if (preview) {
            image.setAttribute('tabindex', '0');
            image.setAttribute('role', 'button');
          } else {
            image.removeAttribute('tabindex');
            image.removeAttribute('role');
          }
        });
    });
  }

  protected onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target instanceof HTMLImageElement) {
      this.open(target, event);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target instanceof HTMLImageElement && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.open(target, event);
    }
  }

  private open(target: HTMLImageElement, event: Event): void {
    const image = { src: target.currentSrc || target.src, alt: target.alt };
    this.imageClick.emit({ originalEvent: event as MouseEvent | KeyboardEvent, ...image });
    if (this.previewImages()) {
      this.preview.set(image);
      this.previewOpen.set(true);
    }
  }
}
