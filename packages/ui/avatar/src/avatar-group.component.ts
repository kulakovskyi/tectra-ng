import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChildren, inject, input, output } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraAvatarTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxPopover, TxPopoverContent, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TX_AVATAR_GROUP, TxAvatarGroupContext } from './avatar-group.token';
import { TxAvatar } from './avatar.component';
import { TxAvatarGroupPart, TxAvatarShape, TxAvatarSize } from './avatar.types';
import { AVATAR_ICON_DEFAULTS } from './avatar.icons';
import { AVATAR_THEME } from './avatar.theme';

@Component({
  selector: 'tx-avatar-group',
  imports: [TxAvatar, TxIcon, TxPopover, TxPopoverContent, TxPopoverTrigger, TxTooltip],
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_AVATAR_GROUP, useFactory: () => inject(TxAvatarGroup).context }],
  host: {
    class: 'tx-avatar-group',
    role: 'group',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'presetSize()',
    '[attr.data-shape]': 'shape() ?? null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
  viewProviders: [provideTxIconDefaults(AVATAR_ICON_DEFAULTS)],
})
export class TxAvatarGroup {
  private readonly avatarTheme = injectTokens(AVATAR_THEME);

  readonly max = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly size = input<TxAvatarSize | number | undefined>(undefined);
  readonly shape = input<TxAvatarShape | undefined>(undefined);
  readonly tooltips = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly morePopover = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly moreLabel = input<string | undefined>(undefined);
  readonly addButton = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly addLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraAvatarTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAvatarGroupPart, TxAvatarGroup> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly add = output<void>();

  readonly avatars = contentChildren(TxAvatar);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('avatarGroup', this, this.pt, this.ptOptions);
  readonly hiddenAvatars = computed(() => {
    const max = this.max();
    return max !== undefined ? this.avatars().slice(Math.max(0, max)) : [];
  });
  readonly extra = computed(() => this.hiddenAvatars().length);
  readonly moreText = computed(() => this.moreLabel() ?? this.translations().moreItems.replace('{count}', '' + this.extra()));
  readonly addText = computed(() => this.addLabel() ?? this.translations().addPerson);
  readonly presetSize = computed(() => {
    const size = this.size();
    return typeof size === 'string' ? size : null;
  });
  readonly hostStyle = computed(() => {
    const size = this.size();
    return {
      ...toStyleObject(this.dt(), '--tx-avatar'),
      '--_overlap': `var(--tx-avatar-group-overlap)`,
      ...(typeof size === 'number' ? { '--tx-avatar-size': `${size}px` } : {}),
      ...this.passThrough().root?.style,
    };
  });

  readonly context: TxAvatarGroupContext = {
    size: this.size,
    shape: this.shape,
    tooltips: this.tooltips,
    isHidden: (avatar) => this.hiddenAvatars().includes(avatar as TxAvatar),
  };

  nameOf(avatar: TxAvatar): string {
    return avatar.name() || avatar.ariaLabel() || avatar.label() || '';
  }
}
