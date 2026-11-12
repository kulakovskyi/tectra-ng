import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterEveryRender, booleanAttribute, computed, inject, input } from '@angular/core';
import { linkDescribedBy, uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraOverlayBadgeTokens, toStyleObject } from '@tectra-ng/themes';
import { TxBadge, TxBadgeSeverity, TxBadgeSize } from '@tectra-ng/ui/badge';
import { TxOverlayBadgePart, TxOverlayBadgeShape } from './overlay-badge.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { OVERLAY_BADGE_ICON_DEFAULTS } from './overlay-badge.icons';

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'tx-overlay-badge',
  imports: [TxBadge],
  template: `
    <ng-content />
    @if (isShown()) {
      <tx-badge
        class="tx-overlay-badge__badge"
        [class]="passThrough().badge?.class"
        [style]="passThrough().badge?.style"
        [id]="badgeId"
        [value]="text()"
        [severity]="severity()"
        [size]="size()"
        [unstyled]="isUnstyled()"
        [attr.aria-label]="ariaLabel() ?? null"
      />
    }
  `,
  styleUrl: './overlay-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-overlay-badge',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-shape]': 'shape()',
  },
  viewProviders: [provideTxIconDefaults(OVERLAY_BADGE_ICON_DEFAULTS)],
})
export class TxOverlayBadge {
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private linked: HTMLElement | null = null;
  private unlink: (() => void) | null = null;

  readonly value = input<string | number | undefined>(undefined);
  readonly severity = input<TxBadgeSeverity>('danger');
  readonly size = input<TxBadgeSize>('medium');
  readonly max = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly showZero = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly hidden = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly shape = input<TxOverlayBadgeShape>('rect');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraOverlayBadgeTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxOverlayBadgePart, TxOverlayBadge> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('overlayBadge', this, this.pt, this.ptOptions);
  readonly badgeId = uniqueId('tx-overlay-badge');
  readonly text = computed(() => {
    const value = this.value();
    const max = this.max();
    return typeof value === 'number' && max !== undefined && value > max ? `${max}+` : value;
  });
  readonly isShown = computed(() => !this.hidden() && (this.showZero() || this.value() !== 0));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-overlay-badge'), ...this.passThrough().root?.style }));

  constructor() {
    afterEveryRender(() => this.link());
    inject(DestroyRef).onDestroy(() => this.unlink?.());
  }

  private link(): void {
    const target = this.isShown() && this.value() !== undefined && this.value() !== '' ? this.host.querySelector<HTMLElement>(FOCUSABLE) : null;
    if (target === this.linked) {
      return;
    }
    this.unlink?.();
    this.unlink = target ? linkDescribedBy(target, this.badgeId) : null;
    this.linked = target;
  }
}
