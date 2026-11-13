import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, inject, input, model, output, signal, viewChild } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraAvatarTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxConfirmService } from '@tectra-ng/ui/confirm';
import { TxMenu, TxMenuItem } from '@tectra-ng/ui/menu';
import { TxProgressSpinner } from '@tectra-ng/ui/progress-spinner';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxAvatar } from './avatar.component';
import { TxAvatarEditorPart, TxAvatarEditorRejection } from './avatar.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { AVATAR_ICON_DEFAULTS } from './avatar.icons';
import { AVATAR_THEME } from './avatar.theme';

/**
 * Tells whether a file matches an `accept` list of extensions (`.png`), MIME types and wildcards (`image/*`); an empty list accepts everything.
 */
export function acceptsFile(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) {
      return name.endsWith(rule);
    }
    if (rule.endsWith('/*')) {
      return type.startsWith(rule.slice(0, -1));
    }
    return type === rule;
  });
}

@Component({
  selector: 'tx-avatar-editor',
  imports: [TxAvatar, TxButton, TxMenu, TxProgressSpinner, TxTooltip],
  templateUrl: './avatar-editor.component.html',
  styleUrl: './avatar-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-avatar-editor',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-avatar-editor--loading]': 'loading()',
    '[class.tx-avatar-editor--dragover]': 'dragOver()',
    '[attr.aria-busy]': 'loading() || null',
  },
  viewProviders: [provideTxIconDefaults(AVATAR_ICON_DEFAULTS)],
})
export class TxAvatarEditor {
  private readonly avatarTheme = injectTokens(AVATAR_THEME);

  readonly image = model<string | null | undefined>(undefined);
  readonly name = input<string | null | undefined>(undefined);
  readonly size = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hint = input<string | undefined>(undefined);
  readonly accept = input('image/*');
  readonly maxFileSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly confirmRemove = input(true, { transform: booleanAttribute });
  readonly changeLabel = input<string | undefined>(undefined);
  readonly removeLabel = input<string | undefined>(undefined);
  readonly removeTitle = input<string | undefined>(undefined);
  readonly removeMessage = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraAvatarTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAvatarEditorPart, TxAvatarEditor> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly photoChange = output<File | null>();
  readonly rejected = output<TxAvatarEditorRejection>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('avatarEditor', this, this.pt, this.ptOptions);
  protected readonly t = injectTranslations();
  private readonly confirm = inject(TxConfirmService);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly menu = viewChild<TxMenu>('menu');

  protected readonly dragOver = signal(false);
  protected readonly hasPhoto = computed(() => !!this.image());
  protected readonly blocked = computed(() => this.loading() || this.disabled());
  protected readonly changeText = computed(() => this.changeLabel() ?? (this.hasPhoto() ? this.t().avatarChangePhoto : this.t().avatarUploadPhoto));
  protected readonly menuItems = computed<TxMenuItem[]>(() => [
    { label: this.changeLabel() ?? this.t().avatarChangePhoto, icon: 'upload', command: () => this.pick() },
    { label: this.removeLabel() ?? this.t().avatarRemovePhoto, icon: 'trash', severity: 'danger', command: () => void this.remove() },
  ]);

  readonly hostStyle = computed(() => {
    const size = this.size();
    return {
      ...toStyleObject(this.dt(), '--tx-avatar'),
      ...(size ? { '--tx-avatar-editor-size': `${size}px` } : {}),
      ...this.passThrough().root?.style,
    };
  });

  pick(): void {
    if (this.blocked()) {
      return;
    }
    const input = this.fileInput().nativeElement;
    input.value = '';
    input.click();
  }

  async remove(): Promise<void> {
    if (this.blocked() || !this.hasPhoto()) {
      return;
    }
    if (this.confirmRemove()) {
      const ok = await this.confirm.dialog({
        title: this.removeTitle() ?? this.t().avatarRemoveTitle,
        message: this.removeMessage() ?? this.t().avatarRemoveMessage,
        severity: 'danger',
        acceptLabel: this.removeLabel() ?? this.t().avatarRemovePhoto,
      });
      if (!ok) {
        return;
      }
    }
    this.photoChange.emit(null);
  }

  protected onBadge(event: MouseEvent): void {
    if (this.hasPhoto()) {
      this.menu()?.toggle(event.currentTarget as Element);
    } else {
      this.pick();
    }
  }

  protected onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.take(file);
    }
  }

  protected onDragOver(event: DragEvent): void {
    if (this.blocked() || !event.dataTransfer?.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.dragOver.set(true);
  }

  protected onDragLeave(): void {
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (this.blocked() || !file) {
      return;
    }
    event.preventDefault();
    this.take(file);
  }

  private take(file: File): void {
    if (!acceptsFile(file, this.accept())) {
      this.rejected.emit({ file, reason: 'type' });
      return;
    }
    const max = this.maxFileSize();
    if (max !== undefined && file.size > max) {
      this.rejected.emit({ file, reason: 'size' });
      return;
    }
    this.photoChange.emit(file);
  }
}
