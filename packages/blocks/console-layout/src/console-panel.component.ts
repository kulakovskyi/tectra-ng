import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TxAppFooter } from '@tectra-ng/blocks/app-footer';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraConsoleLayoutTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { filter } from 'rxjs';
import { TxConsoleLayout } from './console-layout.component';
import { TxConsolePanelPart } from './console-layout.types';
import { CONSOLE_LAYOUT_ICON_DEFAULTS } from './console-layout.icons';
import { CONSOLE_LAYOUT_THEME } from './console-layout.theme';

/** A sticky list or tree at the left of a console page; below 1024px it folds into a bar above the page. */
@Component({
  selector: 'tx-console-panel',
  imports: [TxAppFooter, TxIcon],
  template: `
    <aside
      class="tx-console-panel__aside"
      [attr.aria-label]="label() ?? null"
      [class]="passThrough().aside?.class"
      [style]="passThrough().aside?.style"
    >
      <button
        #toggleButton
        type="button"
        class="tx-console-panel__toggle"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="id + '-nav'"
        [class]="passThrough().toggle?.class"
        [style]="passThrough().toggle?.style"
        (click)="expanded.set(!expanded())"
      >
        <tx-icon class="tx-console-panel__toggle-icon" name="bars" aria-hidden="true" />
        <span class="tx-console-panel__toggle-label">{{ label() ?? translations().menu }}</span>
        <tx-icon class="tx-console-panel__chevron" name="chevron-down" aria-hidden="true" />
      </button>
      <div class="tx-console-panel__collapse" [class.tx-console-panel__collapse--open]="expanded()">
        <div
          class="tx-console-panel__nav"
          [id]="id + '-nav'"
          [class]="passThrough().nav?.class"
          [style]="passThrough().nav?.style"
        >
          <div class="tx-console-panel__nav-inner">
            <ng-content select="[txConsolePanelAside]" />
          </div>
        </div>
      </div>
    </aside>
    <div class="tx-console-panel__main" [class]="passThrough().main?.class" [style]="passThrough().main?.style">
      <div class="tx-console-panel__content" [class]="passThrough().content?.class" [style]="passThrough().content?.style">
        <ng-content />
      </div>
      @if (footerName()) {
        <tx-app-footer variant="console" [name]="footerName()" [links]="footerLinks()" [unstyled]="isUnstyled()" />
      }
    </div>
  `,
  styleUrl: './console-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-console-panel',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-responsive]': 'responsive()',
    '(click)': 'closeOnLink($event)',
    '(keydown.escape)': 'closeFromKeyboard($event)',
  },
  viewProviders: [provideTxIconDefaults(CONSOLE_LAYOUT_ICON_DEFAULTS)],
})
export class TxConsolePanel {
  private readonly consoleLayoutTheme = injectTokens(CONSOLE_LAYOUT_THEME);

  private readonly layout = inject(TxConsoleLayout, { optional: true });
  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('toggleButton');

  readonly label = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraConsoleLayoutTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxConsolePanelPart, TxConsolePanel> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly expanded = signal(false);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  protected readonly translations = injectTranslations();
  protected readonly id = uniqueId('tx-console-panel');
  readonly passThrough = injectPassThrough('consolePanel', this, this.pt, this.ptOptions);
  protected readonly responsive = computed(() => this.layout?.responsive() ?? 'viewport');
  protected readonly footerName = computed(() => this.layout?.footerName() ?? '');
  protected readonly footerLinks = computed(() => this.layout?.visibleFooterLinks() ?? []);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-console-layout'), ...this.passThrough().root?.style }));

  constructor() {
    const unregister = this.layout?.registerPanel();
    if (unregister) {
      inject(DestroyRef).onDestroy(unregister);
    }
    inject(Router, { optional: true })
      ?.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.expanded.set(false));
  }

  protected closeOnLink(event: Event): void {
    const picked = (event.target as HTMLElement | null)?.closest(
      'a[href], [role="treeitem"]:not([aria-expanded]), [role="menuitem"], [role="option"]',
    );
    if (picked?.closest('.tx-console-panel__nav')) {
      this.expanded.set(false);
    }
  }

  protected closeFromKeyboard(event: Event): void {
    if (this.expanded() && (event.target as HTMLElement | null)?.closest('.tx-console-panel__aside')) {
      this.expanded.set(false);
      this.toggleButton()?.nativeElement.focus();
    }
  }
}
