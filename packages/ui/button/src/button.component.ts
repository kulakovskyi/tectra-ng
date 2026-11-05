import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectFluid } from '@tectra/core/fluid';
import { TxRipple } from '@tectra/core/ripple';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra/icons';
import { TectraButtonTokens, TectraDeepPartial, toStyleObject } from '@tectra/themes';
import { TxBadge, TxBadgeSeverity } from '@tectra/ui/badge';
import { TxButtonIconTemplate, TxButtonLoadingIconTemplate } from './button-templates.directive';
import { TxButtonIconPosition, TxButtonPart, TxButtonSeverity, TxButtonSize, TxButtonVariant } from './button.types';

@Component({
  selector: 'button[txButton], a[txButton]',
  imports: [NgTemplateOutlet, TxIcon, TxBadge],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: TxRipple, inputs: ['ripple', 'rippleCentered', 'rippleColor'] }],
  host: {
    class: 'tx-button',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-severity]': 'severity()',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'resolvedVariant()',
    '[attr.data-icon-pos]': 'iconPos()',
    '[class.tx-button--rounded]': 'rounded()',
    '[class.tx-button--raised]': 'raised()',
    '[class.tx-button--plain]': 'plain()',
    '[class.tx-button--fluid]': 'isFluid()',
    '[class.tx-button--icon-only]': 'isIconOnly()',
    '[class.tx-button--no-label]': '!hasLabelText() && !hasProjectedLabel()',
    '[class.tx-button--loading]': 'loading()',
    '[class.tx-button--disabled]': 'isDisabled()',
    '[attr.disabled]': 'isNativeButton && isDisabled() ? "" : null',
    '[attr.aria-disabled]': '!isNativeButton && isDisabled() ? true : null',
    '[attr.tabindex]': '!isNativeButton && isDisabled() ? -1 : (tabindex() ?? null)',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class TxButton {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private txIconRegistry = inject(TxIconRegistry);

  label = input<string | number | undefined>(undefined);
  severity = input<TxButtonSeverity>('primary');
  size = input<TxButtonSize>('medium');
  variant = input<TxButtonVariant | undefined>(undefined);
  outlined = input<boolean, unknown>(false, { transform: booleanAttribute });
  text = input<boolean, unknown>(false, { transform: booleanAttribute });
  link = input<boolean, unknown>(false, { transform: booleanAttribute });
  rounded = input<boolean, unknown>(false, { transform: booleanAttribute });
  raised = input<boolean, unknown>(false, { transform: booleanAttribute });
  plain = input<boolean, unknown>(false, { transform: booleanAttribute });
  fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  tabindex = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  icon = input<TxIconName | (string & {}) | undefined>(undefined);
  iconPos = input<TxButtonIconPosition>('left');
  iconOnly = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  loadingIcon = input<TxIconName | (string & {})>('spinner');
  badge = input<string | number | undefined>(undefined);
  badgeSeverity = input<TxBadgeSeverity>('secondary');
  dt = input<TectraDeepPartial<TectraButtonTokens> | undefined>(undefined);
  pt = input<TxPassThrough<TxButtonPart, TxButton> | undefined>(undefined);
  ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  iconTemplate = contentChild(TxButtonIconTemplate);
  loadingIconTemplate = contentChild(TxButtonLoadingIconTemplate);
  contentElement = viewChild.required<ElementRef<HTMLElement>>('content');

  readonly isNativeButton = this.elementRef.nativeElement.tagName === 'BUTTON';

  hasProjectedLabel = signal(false);
  isUnstyled = injectUnstyled(this.unstyled);
  isFluid = injectFluid(this.fluid);
  passThrough = injectPassThrough('button', this, this.pt, this.ptOptions);

  resolvedVariant = computed<TxButtonVariant | null>(() => {
    const variant = this.variant();
    if (variant) {
      return variant;
    }
    if (this.link()) {
      return 'link';
    }
    if (this.text()) {
      return 'text';
    }
    return this.outlined() ? 'outlined' : null;
  });
  isDisabled = computed(() => this.disabled() || this.loading());
  hasIcon = computed(() => this.loading() || !!this.icon() || !!this.iconTemplate());
  hasLabelText = computed(() => this.label() !== undefined && this.label() !== '');
  isIconOnly = computed(() => this.iconOnly() ?? (this.hasIcon() && !this.hasLabelText() && !this.hasProjectedLabel()));
  iconName = computed(() => {
    const icon = this.icon();
    return this.txIconRegistry.has(icon) ? icon : null;
  });
  loadingIconName = computed(() => {
    const icon = this.loadingIcon();
    return this.txIconRegistry.has(icon) ? icon : null;
  });
  hasBadge = computed(() => this.badge() !== undefined && this.badge() !== '');
  hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-button'), ...this.passThrough().root?.style }));

  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = this.elementRef.nativeElement;
    const blockClick = (event: Event) => {
      if (this.isDisabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    host.addEventListener('click', blockClick, { capture: true });
    destroyRef.onDestroy(() => host.removeEventListener('click', blockClick, { capture: true }));
    afterNextRender(() => {
      const content = this.contentElement().nativeElement;
      const update = () => this.hasProjectedLabel.set(!!content.textContent?.trim() || content.children.length > 0);
      update();
      const observer = new MutationObserver(update);
      observer.observe(content, { childList: true, characterData: true, subtree: true });
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
