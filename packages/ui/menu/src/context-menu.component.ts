import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { injectTokens, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraMenuTokens } from '@tectra-ng/themes';
import { TxMenu } from './menu.component';
import { TxMenuItem, TxMenuItemEvent, TxMenuPart } from './menu.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { MENU_ICON_DEFAULTS } from './menu.icons';
import { MENU_THEME } from './menu.theme';

@Component({
  selector: 'tx-context-menu',
  imports: [TxMenu],
  template: `
    <tx-tiered-menu
      popup
      variant="context"
      placement="bottom-start"
      [offset]="0"
      [model]="model()"
      [ariaLabel]="ariaLabel()"
      [dt]="dt()"
      [pt]="pt()"
      [ptOptions]="ptOptions()"
      [unstyled]="unstyled()"
      (itemSelected)="itemSelected.emit($event)"
      (opened)="opened.emit()"
      (closed)="onClosed()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-context-menu-host', style: 'display: contents' },
  viewProviders: [provideTxIconDefaults(MENU_ICON_DEFAULTS)],
})
export class TxContextMenu {
  private readonly menuTheme = injectTokens(MENU_THEME);

  private document = inject(DOCUMENT);
  private anchor: HTMLElement | null = null;
  private readonly menu = viewChild.required(TxMenu);

  readonly model = input<TxMenuItem[]>([]);
  readonly target = input<Element | null | undefined>(undefined);
  readonly global = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraMenuTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxMenuPart, TxMenu> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly itemSelected = output<TxMenuItemEvent>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  constructor() {
    effect((onCleanup) => {
      const target = this.global() ? this.document : this.target();
      if (!target) {
        return;
      }
      const onContextMenu = (event: Event) => this.show(event as MouseEvent);
      const onKeydown = (event: Event) => {
        const key = event as KeyboardEvent;
        if (key.key === 'ContextMenu' || (key.key === 'F10' && key.shiftKey)) {
          this.show(key);
        }
      };
      target.addEventListener('contextmenu', onContextMenu);
      target.addEventListener('keydown', onKeydown);
      onCleanup(() => {
        target.removeEventListener('contextmenu', onContextMenu);
        target.removeEventListener('keydown', onKeydown);
      });
    });
    inject(DestroyRef).onDestroy(() => this.anchor?.remove());
  }

  show(event: MouseEvent | KeyboardEvent): void {
    event.preventDefault();
    const point = this.pointOf(event);
    this.menu().hide();
    this.anchor?.remove();
    const anchor = this.document.createElement('div');
    Object.assign(anchor.style, { position: 'fixed', left: `${point.x}px`, top: `${point.y}px`, width: '0', height: '0', pointerEvents: 'none' });
    this.document.body.appendChild(anchor);
    this.anchor = anchor;
    this.menu().show(anchor, 'first', true);
  }

  hide(): void {
    this.menu().hide();
  }

  onClosed(): void {
    this.anchor?.remove();
    this.anchor = null;
    this.closed.emit();
  }

  private pointOf(event: MouseEvent | KeyboardEvent): { x: number; y: number } {
    if (event instanceof MouseEvent && (event.clientX || event.clientY)) {
      return { x: event.clientX, y: event.clientY };
    }
    const element = (this.document.activeElement as HTMLElement | null) ?? (event.target as HTMLElement);
    const rect = element.getBoundingClientRect();
    return { x: rect.left, y: rect.bottom };
  }
}
