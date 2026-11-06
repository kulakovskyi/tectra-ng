import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  OnInit,
  TemplateRef,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TX_TABS } from './tabs.context';
import { TxTabPanelContentContext, TxTabValue } from './tabs.types';

@Directive({ selector: 'ng-template[txTabPanelContent]' })
export class TxTabPanelContent {
  readonly template = inject<TemplateRef<TxTabPanelContentContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxTabPanelContent, context: unknown): context is TxTabPanelContentContext {
    return !!context;
  }
}

@Component({
  selector: 'tx-tab-panel',
  imports: [NgTemplateOutlet],
  template: `
    @if (!tabs.lazy() || active()) {
      <ng-content />
    }
    @if (lazyContent(); as content) {
      @if (active() || (visited() && !tabs.lazy())) {
        <ng-container *ngTemplateOutlet="content.template; context: { $implicit: value(), value: value() }" />
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    :host([data-styled]:focus-visible) {
      outline: var(--tx-tabs-focus-ring-width) solid var(--tx-tabs-focus-ring-color);
      outline-offset: var(--tx-tabs-segmented-focus-ring-offset);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-tab-panel',
    role: 'tabpanel',
    tabindex: '0',
    '[class]': 'tabs.passThrough().panel?.class',
    '[style]': 'tabs.passThrough().panel?.style',
    '[attr.data-styled]': '!tabs.isUnstyled() || null',
    '[id]': 'tabs.panelId(value())',
    '[attr.aria-labelledby]': 'tabs.tabId(value())',
    '[attr.hidden]': 'active() ? null : ""',
    '[class.tx-tab-panel--active]': 'active()',
  },
})
export class TxTabPanel implements OnInit {
  protected readonly tabs = inject(TX_TABS);

  readonly value = input.required<TxTabValue>();

  protected readonly lazyContent = contentChild(TxTabPanelContent);
  protected readonly visited = signal(false);
  readonly active = computed(() => this.tabs.value() === this.value());

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const unregister = this.tabs.registerPanel(this.value);
    this.destroyRef.onDestroy(unregister);
  }

  constructor() {
    effect(() => {
      if (this.active()) {
        untracked(() => this.visited.set(true));
      }
    });
  }
}
