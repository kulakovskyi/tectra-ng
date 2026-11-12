import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { TxAppFooter, TxAppFooterLink } from '@tectra-ng/blocks/app-footer';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraConsoleLayoutTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { filter, of } from 'rxjs';
import { TxConsoleDocument } from './console-document.service';
import { TxConsoleLayoutPart, TxConsoleRailItem, TxConsoleResponsive, TxConsoleTranslate } from './console-layout.types';
import { TxConsoleRail } from './console-rail.component';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CONSOLE_LAYOUT_ICON_DEFAULTS } from './console-layout.icons';
import { CONSOLE_LAYOUT_THEME } from './console-layout.theme';

@Component({
  selector: 'tx-console-layout',
  imports: [NgTemplateOutlet, RouterLink, TxConsoleRail, TxAppFooter],
  templateUrl: './console-layout.component.html',
  styleUrl: './console-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TxConsoleDocument],
  host: {
    class: 'tx-console-layout',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-responsive]': 'responsive()',
  },
  viewProviders: [provideTxIconDefaults(CONSOLE_LAYOUT_ICON_DEFAULTS)],
})
export class TxConsoleLayout {
  private readonly consoleLayoutTheme = injectTokens(CONSOLE_LAYOUT_THEME);

  private readonly router = inject(Router, { optional: true });
  private readonly consoleDocument = inject(TxConsoleDocument);

  readonly title = input.required<string>();
  readonly titleMuted = input<string | undefined>(undefined);
  readonly logo = input<string | undefined>(undefined);
  readonly homeLink = input<string | readonly unknown[] | undefined>(undefined);
  readonly railItems = input<readonly TxConsoleRailItem[]>([]);
  readonly railLabel = input<string | undefined>(undefined);
  readonly crumbKey = input<string>('crumb');
  readonly crumbs = input<readonly string[] | undefined>(undefined);
  readonly footerName = input<string | undefined>(undefined);
  readonly footerLinks = input<readonly TxAppFooterLink[]>([]);
  readonly documentTitle = input<string | undefined>(undefined);
  readonly favicon = input<string | undefined>(undefined);
  readonly translate = input<TxConsoleTranslate | undefined>(undefined);
  readonly responsive = input<TxConsoleResponsive>('viewport');
  readonly dt = input<TectraDeepPartial<TectraConsoleLayoutTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxConsoleLayoutPart, TxConsoleLayout> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('consoleLayout', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-console-layout'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));

  private readonly panels = signal(0);
  readonly hasPanel = computed(() => this.panels() > 0);

  private readonly navigationEnd = toSignal(this.router ? this.router.events.pipe(filter((event) => event instanceof NavigationEnd)) : of(null), {
    initialValue: null,
  });

  readonly visibleCrumbs = computed(() => {
    const own = this.crumbs();
    if (own) {
      return own.map((crumb) => this.text(crumb));
    }
    this.navigationEnd();
    return this.routeCrumbs(this.crumbKey()).map((crumb) => this.text(crumb));
  });

  protected readonly visibleRailItems = computed(() => this.railItems().map((item) => ({ ...item, label: this.text(item.label) })));
  readonly visibleFooterLinks = computed(() => this.footerLinks().map((link) => ({ ...link, label: this.text(link.label) })));
  protected readonly railName = computed(() => this.railLabel() ?? this.translations().consoleSections);
  readonly pageTitle = computed(() => [this.visibleCrumbs().at(-1), this.documentTitle()].filter(Boolean).join(' · '));

  constructor() {
    effect(() => {
      if (this.documentTitle()) {
        this.consoleDocument.setTitle(this.pageTitle());
      }
    });
    effect(() => {
      const favicon = this.favicon();
      if (favicon) {
        this.consoleDocument.setFavicon(favicon);
      }
    });
  }

  registerPanel(): () => void {
    this.panels.update((count) => count + 1);
    return () => this.panels.update((count) => count - 1);
  }

  private text(key: string): string {
    return this.translate()?.(key) ?? key;
  }

  private routeCrumbs(key: string): string[] {
    const crumbs: string[] = [];
    let current: ActivatedRouteSnapshot | null = this.router?.routerState.snapshot.root ?? null;
    while (current) {
      const crumb: unknown = current.routeConfig?.data?.[key];
      if (typeof crumb === 'string') {
        crumbs.push(crumb);
      }
      current = current.firstChild;
    }
    return crumbs;
  }
}
