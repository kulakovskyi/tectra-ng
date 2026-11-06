import { ChangeDetectionStrategy, Component, computed, contentChildren, inject, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraAvatarTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TX_AVATAR_GROUP, TxAvatarGroupContext } from './avatar-group.token';
import { TxAvatar } from './avatar.component';
import { TxAvatarGroupPart, TxAvatarShape, TxAvatarSize } from './avatar.types';

@Component({
  selector: 'tx-avatar-group',
  imports: [TxAvatar],
  template: `
    <ng-content />
    @if (extra() > 0) {
      <tx-avatar
        class="tx-avatar-group__more"
        [class]="passThrough().more?.class"
        [style]="passThrough().more?.style"
        [label]="'+' + extra()"
        [ariaLabel]="moreLabel() ?? translations().moreItems.replace('{count}', '' + extra())"
        [unstyled]="isUnstyled()"
      />
    }
    <ng-content select="[txAvatarGroupEnd]" />
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }

    :host([data-styled]) ::ng-deep > tx-avatar {
      box-shadow: 0 0 0 var(--tx-avatar-group-ring-width) var(--tx-avatar-group-ring-color);
    }

    :host([data-styled]) ::ng-deep > tx-avatar + tx-avatar {
      margin-inline-start: calc(var(--_size, var(--tx-avatar-size)) * var(--_overlap) * -1);
    }

    :host([data-styled]) ::ng-deep > [txAvatarGroupEnd] {
      margin-inline-start: 6px;
    }

    :host([data-styled]) .tx-avatar-group__more {
      background: var(--tx-avatar-group-more-background);
      color: var(--tx-avatar-group-more-color);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_AVATAR_GROUP, useFactory: () => inject(TxAvatarGroup).context }],
  host: {
    class: 'tx-avatar-group',
    role: 'group',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
})
export class TxAvatarGroup {
  readonly max = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly size = input<TxAvatarSize | number | undefined>(undefined);
  readonly shape = input<TxAvatarShape | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly moreLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraAvatarTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAvatarGroupPart, TxAvatarGroup> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly avatars = contentChildren(TxAvatar);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('avatarGroup', this, this.pt, this.ptOptions);
  readonly extra = computed(() => {
    const max = this.max();
    return max !== undefined ? Math.max(0, this.avatars().length - max) : 0;
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
    isHidden: (avatar) => {
      const max = this.max();
      const index = this.avatars().indexOf(avatar as TxAvatar);
      return max !== undefined && index >= max;
    },
  };
}
