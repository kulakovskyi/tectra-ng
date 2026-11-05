import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, input, output, viewChild } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraDeepPartial, TectraSplitButtonTokens, toStyleObject } from '@tectra/themes';
import { TxButton, TxButtonSeverity, TxButtonSize } from '@tectra/ui/button';
import { TxButtonGroup } from '@tectra/ui/button-group';
import { TxMenu, TxMenuFocus, TxMenuItem, TxMenuItemEvent } from '@tectra/ui/menu';
import { TxSplitButtonPart } from './split-button.types';

@Component({
  selector: 'tx-split-button',
  imports: [TxButtonGroup, TxButton, TxMenu],
  template: `
    <tx-button-group class="tx-split-button__group">
      <button
        txButton
        type="button"
        class="tx-split-button__button"
        [class]="passThrough().button?.class"
        [style]="passThrough().button?.style"
        [label]="label()"
        [icon]="icon()"
        [severity]="severity()"
        [size]="size()"
        [outlined]="outlined()"
        [text]="text()"
        [raised]="raised()"
        [rounded]="rounded()"
        [disabled]="disabled()"
        [loading]="loading()"
        [unstyled]="isUnstyled()"
        (click)="clicked.emit($event)"
      >
        <ng-content />
      </button>
      <button
        txButton
        type="button"
        class="tx-split-button__menu-button"
        icon="chevron-down"
        aria-haspopup="menu"
        [class]="passThrough().menuButton?.class"
        [style]="passThrough().menuButton?.style"
        [severity]="severity()"
        [size]="size()"
        [outlined]="outlined()"
        [text]="text()"
        [raised]="raised()"
        [rounded]="rounded()"
        [disabled]="disabled() || menuDisabled()"
        [unstyled]="isUnstyled()"
        [attr.aria-label]="menuLabel()"
        [attr.aria-expanded]="menu().isOpen()"
        [attr.aria-controls]="menu().isOpen() ? menu().id : null"
        (click)="menu().toggle(group().nativeElement)"
        (keydown.arrowdown)="open($event, 'first')"
        (keydown.arrowup)="open($event, 'last')"
      ></button>
    </tx-button-group>
    <tx-tiered-menu
      popup
      placement="bottom-end"
      [model]="model()"
      [ariaLabel]="menuLabel()"
      [unstyled]="isUnstyled()"
      (itemSelected)="itemSelected.emit($event)"
      (opened)="menuOpened.emit()"
      (closed)="menuClosed.emit()"
    />
  `,
  styleUrl: './split-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-split-button',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-filled]': '!outlined() && !text() || null',
  },
})
export class TxSplitButton {
  readonly label = input<string | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
  readonly model = input<TxMenuItem[]>([]);
  readonly severity = input<TxButtonSeverity>('primary');
  readonly size = input<TxButtonSize>('medium');
  readonly outlined = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly text = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly raised = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly rounded = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly menuDisabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly menuAriaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraSplitButtonTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSplitButtonPart, TxSplitButton> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly clicked = output<MouseEvent>();
  readonly itemSelected = output<TxMenuItemEvent>();
  readonly menuOpened = output<void>();
  readonly menuClosed = output<void>();

  readonly group = viewChild.required(TxButtonGroup, { read: ElementRef<HTMLElement> });
  readonly menu = viewChild.required(TxMenu);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('splitButton', this, this.pt, this.ptOptions);
  readonly menuLabel = computed(() => this.menuAriaLabel() ?? this.translations().moreActions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-split-button'), ...this.passThrough().root?.style }));

  open(event: Event, focus: TxMenuFocus): void {
    event.preventDefault();
    this.menu().show(this.group().nativeElement, focus);
  }
}
