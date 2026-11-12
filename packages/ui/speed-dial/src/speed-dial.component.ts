import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxPlacement } from '@tectra-ng/core/overlay';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraSpeedDialTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton, TxButtonSeverity, TxButtonSize } from '@tectra-ng/ui/button';
import { TxMenuItem, TxMenuItemEvent } from '@tectra-ng/ui/menu';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxSpeedDialDirection, TxSpeedDialPart, TxSpeedDialType } from './speed-dial.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { SPEED_DIAL_ICON_DEFAULTS } from './speed-dial.icons';
import { SPEED_DIAL_THEME } from './speed-dial.theme';

const ARCS: Record<string, [number, number]> = {
  'semi-circle up': [180, 360],
  'semi-circle down': [0, 180],
  'semi-circle left': [90, 270],
  'semi-circle right': [-90, 90],
  'quarter-circle up-left': [180, 270],
  'quarter-circle up-right': [270, 360],
  'quarter-circle down-left': [90, 180],
  'quarter-circle down-right': [0, 90],
};

const LINEAR: Record<string, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
  'up-left': [-1, -1],
  'up-right': [1, -1],
  'down-left': [-1, 1],
  'down-right': [1, 1],
};

@Component({
  selector: 'tx-speed-dial',
  imports: [TxButton, TxTooltip],
  templateUrl: './speed-dial.component.html',
  styleUrl: './speed-dial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-speed-dial',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-direction]': 'direction()',
    '[attr.data-type]': 'type()',
    '[class.tx-speed-dial--open]': 'visible()',
    '[class.tx-speed-dial--rotate]': '!hideIcon()',
  },
  viewProviders: [provideTxIconDefaults(SPEED_DIAL_ICON_DEFAULTS)],
})
export class TxSpeedDial {
  private readonly speedDialTheme = injectTokens(SPEED_DIAL_THEME);

  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private document = inject(DOCUMENT);

  readonly model = input<TxMenuItem[]>([]);
  readonly visible = model(false);
  readonly direction = input<TxSpeedDialDirection>('up');
  readonly type = input<TxSpeedDialType>('linear');
  readonly radius = input<number, unknown>(80, { transform: numberAttribute });
  readonly mask = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly hideOnClickOutside = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showIcon = input<string>('plus');
  readonly hideIcon = input<string | undefined>(undefined);
  readonly severity = input<TxButtonSeverity>('primary');
  readonly itemSeverity = input<TxButtonSeverity>('secondary');
  readonly size = input<TxButtonSize>('medium');
  readonly itemSize = input<TxButtonSize>('small');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraSpeedDialTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSpeedDialPart, TxSpeedDial> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly itemSelected = output<TxMenuItemEvent>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  private readonly button = viewChild.required('button', { read: ElementRef });
  private readonly sizes = signal({ button: 37, item: 30, gap: 7 });

  readonly listId = uniqueId('tx-speed-dial');
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('speedDial', this, this.pt, this.ptOptions);
  readonly items = computed(() => this.model().filter((item) => item.visible !== false && !item.separator));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-speed-dial'), ...this.passThrough().root?.style }));
  readonly currentIcon = computed(() => (this.visible() ? (this.hideIcon() ?? this.showIcon()) : this.showIcon()));
  readonly tooltipPlacement = computed<TxPlacement>(() => {
    const direction = this.direction();
    if (this.type() !== 'linear') {
      return 'top';
    }
    return direction === 'up' || direction === 'down' ? 'left' : 'top';
  });
  readonly offsets = computed(() => {
    const count = this.items().length;
    const type = this.type();
    const direction = this.direction();
    if (type === 'linear') {
      const [dx, dy] = LINEAR[direction] ?? LINEAR['up'];
      const { button, item, gap } = this.sizes();
      return this.items().map((_, index) => {
        const distance = button / 2 + gap + item / 2 + index * (item + gap);
        return { x: dx * distance, y: dy * distance };
      });
    }
    const [start, end] = type === 'circle' ? [-90, 270] : (ARCS[`${type} ${direction}`] ?? ARCS[`${type} up`] ?? [180, 270]);
    const spread = type === 'circle' ? (end - start) / Math.max(count, 1) : (end - start) / Math.max(count - 1, 1);
    return this.items().map((_, index) => {
      const angle = ((start + spread * index) * Math.PI) / 180;
      return { x: Math.round(Math.cos(angle) * this.radius()), y: Math.round(Math.sin(angle) * this.radius()) };
    });
  });

  constructor() {
    effect((onCleanup) => {
      if (!this.visible() || !this.hideOnClickOutside()) {
        return;
      }
      const listener = (event: Event) => {
        if (!(event.target instanceof Node) || !this.host.contains(event.target)) {
          this.hide();
        }
      };
      this.document.addEventListener('pointerdown', listener, true);
      onCleanup(() => this.document.removeEventListener('pointerdown', listener, true));
    });
  }

  itemStyle(index: number): Record<string, string> {
    const offset = this.offsets()[index] ?? { x: 0, y: 0 };
    return { '--_x': `${offset.x}px`, '--_y': `${offset.y}px`, '--_i': String(index), ...this.passThrough().item?.style };
  }

  show(focusFirst = false): void {
    if (this.disabled()) {
      return;
    }
    this.measure();
    if (!this.visible()) {
      this.visible.set(true);
      this.opened.emit();
    }
    if (focusFirst) {
      setTimeout(() => this.focusItem(0));
    }
  }

  hide(focusButton = false): void {
    if (this.visible()) {
      this.visible.set(false);
      this.closed.emit();
    }
    if (focusButton) {
      (this.button().nativeElement as HTMLElement).focus();
    }
  }

  toggle(event?: MouseEvent): void {
    if (this.visible()) {
      this.hide();
    } else {
      this.show(event?.detail === 0);
    }
  }

  run(item: TxMenuItem, event: Event): void {
    if (item.disabled) {
      return;
    }
    const itemEvent: TxMenuItemEvent = { item, originalEvent: event };
    item.command?.(itemEvent);
    this.itemSelected.emit(itemEvent);
    this.hide(true);
  }

  onButtonKeydown(event: KeyboardEvent): void {
    if (event.key.startsWith('Arrow') && !this.visible()) {
      event.preventDefault();
      this.show(true);
    } else if (event.key === 'Escape' && this.visible()) {
      event.preventDefault();
      this.hide();
    }
  }

  onListKeydown(event: KeyboardEvent): void {
    const elements = this.itemElements();
    const current = elements.indexOf(this.document.activeElement as HTMLElement);
    const [nextKeys, previousKeys] = this.arrowKeys();
    if (nextKeys.includes(event.key)) {
      event.preventDefault();
      this.focusItem((current + 1) % elements.length);
    } else if (previousKeys.includes(event.key)) {
      event.preventDefault();
      this.focusItem((current - 1 + elements.length) % elements.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.focusItem(event.key === 'Home' ? 0 : elements.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.hide(true);
    } else if (event.key === 'Tab') {
      this.hide();
    }
  }

  private arrowKeys(): [string[], string[]] {
    const direction = this.direction();
    if (this.type() === 'linear') {
      const forward = direction.startsWith('up') ? 'ArrowUp' : direction.startsWith('down') ? 'ArrowDown' : direction === 'left' ? 'ArrowLeft' : 'ArrowRight';
      const back = { ArrowUp: 'ArrowDown', ArrowDown: 'ArrowUp', ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft' }[forward] as string;
      return [[forward], [back]];
    }
    return [
      ['ArrowRight', 'ArrowDown'],
      ['ArrowLeft', 'ArrowUp'],
    ];
  }

  private focusItem(index: number): void {
    this.itemElements()[index]?.focus();
  }

  private itemElements(): HTMLElement[] {
    return [...this.host.querySelectorAll<HTMLElement>('.tx-speed-dial__item:not([disabled])')];
  }

  private measure(): void {
    const button = this.button().nativeElement as HTMLElement;
    const item = this.host.querySelector<HTMLElement>('.tx-speed-dial__item');
    const gap = parseFloat(this.document.defaultView?.getComputedStyle(this.host).getPropertyValue('--tx-speed-dial-gap') ?? '') || 7;
    if (button.offsetWidth) {
      this.sizes.set({ button: button.offsetWidth, item: item?.offsetWidth || button.offsetWidth, gap });
    }
  }
}
