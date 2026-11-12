import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, inject, input, output } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraBreadcrumbTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxBreadcrumbItemTemplate, TxBreadcrumbSeparatorTemplate } from './breadcrumb.templates';
import { TxBreadcrumbItem, TxBreadcrumbItemEvent, TxBreadcrumbPart, TxBreadcrumbSeparator } from './breadcrumb.types';
import { BREADCRUMB_ICON_DEFAULTS } from './breadcrumb.icons';
import { BREADCRUMB_THEME } from './breadcrumb.theme';

type TxBreadcrumbKind = 'current' | 'router' | 'url' | 'command' | 'text';

interface TxBreadcrumbEntry {
  item: TxBreadcrumbItem;
  kind: TxBreadcrumbKind;
  current: boolean;
  icon: string | null;
  iconClass: string | null;
}

@Component({
  selector: 'tx-breadcrumb',
  imports: [NgTemplateOutlet, RouterLink, TxIcon],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-breadcrumb',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-separator]': 'separator()',
  },
  viewProviders: [provideTxIconDefaults(BREADCRUMB_ICON_DEFAULTS)],
})
export class TxBreadcrumb {
  private readonly breadcrumbTheme = injectTokens(BREADCRUMB_THEME);

  private txIconRegistry = injectTxIcons();
  private hasRouter = inject(ActivatedRoute, { optional: true }) !== null;

  readonly model = input<readonly TxBreadcrumbItem[]>([]);
  readonly home = input<TxBreadcrumbItem | undefined>(undefined);
  readonly separator = input<TxBreadcrumbSeparator>('chevron');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraBreadcrumbTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxBreadcrumbPart, TxBreadcrumb> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly itemClick = output<TxBreadcrumbItemEvent>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('breadcrumb', this, this.pt, this.ptOptions);
  protected readonly itemTemplate = contentChild(TxBreadcrumbItemTemplate);
  protected readonly separatorTemplate = contentChild(TxBreadcrumbSeparatorTemplate);

  readonly entries = computed<TxBreadcrumbEntry[]>(() => {
    const home = this.home();
    const items = home ? [home, ...this.model()] : [...this.model()];
    return items.map((item, index) => this.toEntry(item, index === items.length - 1));
  });
  readonly label = computed(() => this.ariaLabel() ?? this.translations().breadcrumb);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-breadcrumb'), ...this.passThrough().root?.style }));

  select(event: Event, item: TxBreadcrumbItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    const payload = { originalEvent: event, item };
    item.command?.(payload);
    this.itemClick.emit(payload);
  }

  private toEntry(item: TxBreadcrumbItem, current: boolean): TxBreadcrumbEntry {
    const icon = item.icon ?? null;
    const known = icon !== null && this.txIconRegistry.has(icon);
    return { item, current, kind: this.kindOf(item, current), icon: known ? icon : null, iconClass: icon !== null && !known ? icon : null };
  }

  private kindOf(item: TxBreadcrumbItem, current: boolean): TxBreadcrumbKind {
    if (current) return 'current';
    if (item.disabled) return 'text';
    if (item.routerLink !== undefined && this.hasRouter) return 'router';
    if (item.url !== undefined || item.routerLink !== undefined) return 'url';
    if (item.command) return 'command';
    return 'text';
  }

  protected href(item: TxBreadcrumbItem): string {
    if (item.url !== undefined) return item.url;
    const commands = item.routerLink;
    return typeof commands === 'string' ? commands : (commands ?? []).join('/');
  }
}
