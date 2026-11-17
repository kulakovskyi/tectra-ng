import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TectraAvatarTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TX_AVATAR_GROUP } from './avatar-group.token';
import { TX_AVATAR_OPTIONS, avatarInitials } from './avatar.options';
import { TxAvatarPart, TxAvatarShape, TxAvatarSize, TxAvatarTone, TxAvatarTooltip } from './avatar.types';
import { AVATAR_ICON_DEFAULTS } from './avatar.icons';
import { AVATAR_THEME } from './avatar.theme';

const TONES: TxAvatarTone[] = ['blue', 'green', 'sky', 'orange', 'purple', 'red'];

@Component({
  selector: 'tx-avatar',
  imports: [TxIcon],
  template: `
    @if (showImage()) {
      <img class="tx-avatar__image" alt="" [src]="image()" [class]="passThrough().image?.class" [style]="passThrough().image?.style" (error)="onImageError($event)" />
    } @else if (initials(); as text) {
      <span class="tx-avatar__label" aria-hidden="true" [class]="passThrough().label?.class" [style]="passThrough().label?.style">{{ text }}</span>
    } @else {
      <span class="tx-avatar__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
        @if (iconName(); as name) {
          <tx-icon [name]="name" />
        } @else {
          <span [class]="icon()"></span>
        }
      </span>
    }
    <ng-content />
  `,
  styleUrl: './avatar.component.scss',
  hostDirectives: [{ directive: TxTooltip, inputs: ['tooltipPlacement'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-avatar',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'presetSize()',
    '[attr.data-shape]': 'resolvedShape()',
    '[attr.data-tone]': 'showImage() ? null : resolvedTone()',
    '[attr.role]': 'accessibleName() ? "img" : null',
    '[attr.aria-label]': 'accessibleName()',
    '[attr.aria-hidden]': 'accessibleName() ? null : true',
    '[attr.title]': 'showsTooltip() || tooltip() === "none" ? null : (name() ?? null)',
    '[hidden]': 'isHidden()',
  },
  viewProviders: [provideTxIconDefaults(AVATAR_ICON_DEFAULTS)],
})
export class TxAvatar {
  private readonly avatarTheme = injectTokens(AVATAR_THEME);

  private txIconRegistry = injectTxIcons();
  private group = inject(TX_AVATAR_GROUP, { optional: true });
  private options = inject(TX_AVATAR_OPTIONS, { optional: true });

  readonly image = input<string | null | undefined>(undefined);
  readonly name = input<string | null | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly icon = input<TxIconName | (string & {})>('user');
  readonly size = input<TxAvatarSize | 'fill' | number | undefined>(undefined);
  readonly shape = input<TxAvatarShape | undefined>(undefined);
  readonly tone = input<TxAvatarTone | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly tooltip = input<TxAvatarTooltip | undefined, unknown>(undefined, { transform: avatarTooltip });
  readonly dt = input<TectraDeepPartial<TectraAvatarTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAvatarPart, TxAvatar> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly imageError = output<Event>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('avatar', this, this.pt, this.ptOptions);
  readonly failed = signal(false);
  readonly showImage = computed(() => {
    const image = this.image()?.trim();
    return !!image && !this.failed() && !this.isPlaceholder(image);
  });
  readonly initials = computed(() => {
    const name = this.name()?.trim();
    return this.label() ?? (name ? (this.options?.initials ?? avatarInitials)(name) : '');
  });
  readonly resolvedSize = computed(() => this.size() ?? this.group?.size() ?? 'medium');
  readonly presetSize = computed(() => (typeof this.resolvedSize() === 'number' ? null : this.resolvedSize()));
  readonly resolvedShape = computed(() => this.shape() ?? this.group?.shape() ?? 'circle');
  readonly resolvedTone = computed(() => {
    const named = this.name() || this.label();
    return this.tone() ?? (named ? (this.options?.tone ?? TONES[hash(this.name() ?? named) % TONES.length]) : null);
  });
  readonly accessibleName = computed(() => this.ariaLabel() ?? this.name() ?? null);
  readonly showsTooltip = computed(() => {
    const tooltip = this.tooltip();
    return tooltip !== 'none' && (tooltip ?? this.group?.tooltips() ?? false) && !!this.tooltipText();
  });
  readonly tooltipText = computed(() => this.name() || this.ariaLabel() || '');
  readonly isHidden = computed(() => !!this.group?.isHidden(this));
  readonly iconName = computed(() => (this.txIconRegistry.has(this.icon()) ? this.icon() : null));
  readonly hostStyle = computed(() => {
    const size = this.resolvedSize();
    return {
      ...toStyleObject(this.dt(), '--tx-avatar'),
      ...(typeof size === 'number' ? { '--tx-avatar-size': `${size}px` } : {}),
      ...this.passThrough().root?.style,
    };
  });

  constructor() {
    inject(TxTooltip, { self: true }).useContent(computed(() => (this.showsTooltip() ? this.tooltipText() : undefined)));
    effect(() => {
      this.image();
      this.failed.set(false);
    });
  }

  onImageError(event: Event): void {
    this.failed.set(true);
    this.imageError.emit(event);
  }

  private isPlaceholder(image: string): boolean {
    return !!this.options?.placeholderImages?.some((placeholder) => (typeof placeholder === 'string' ? placeholder.trim() === image : placeholder.test(image)));
  }
}

function avatarTooltip(value: unknown): TxAvatarTooltip | undefined {
  return value === 'none' ? 'none' : optionalBoolean(value);
}

function hash(text: string): number {
  let value = 0;
  for (const char of text) {
    value = (value * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return value;
}
