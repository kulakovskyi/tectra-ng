import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxAppFooter } from '@tectra-ng/blocks/app-footer';
import { TxAppLayout } from '@tectra-ng/blocks/app-layout';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';
import { TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'app-layout-responsive-example',
  imports: [TxAppLayout, TxAppFooter, TxPageHeader, TxAvatar, TxButton, TxCard, TxTabs, TxTooltip],
  template: `
    <tx-tabs
      class="variants"
      variant="pills"
      ariaLabel="Device"
      [tabs]="devices"
      [(value)]="device"
    />
    <div class="stage">
      <div class="screen" [style.width]="width()">
        <tx-app-layout
          responsive="container"
          title="Reports"
          logo="/favicon.svg"
          backdrop
          [model]="menu()"
          [dt]="{ root: { minHeight: '100%', viewportHeight: '558px' } }"
        >
          <div txAppTopbar class="topbar">
            <button
              txButton
              text
              severity="secondary"
              icon="bell"
              aria-label="Notifications"
              txTooltip="Notifications"
            ></button>
            <tx-avatar name="Anna Koval" size="small" />
          </div>
          <tx-page-header [title]="page()" subtitle="Everything at a glance" class="header" />
          <div class="cards">
            <tx-card title="1 240" subtitle="Visits today" />
            <tx-card title="38" subtitle="New sign-ups" />
            <tx-card title="4" subtitle="Open tickets" />
          </div>
          <tx-app-footer txAppFooter variant="app" name="Reports" [year]="2026" />
        </tx-app-layout>
      </div>
    </div>
  `,
  styles: `
    .variants {
      display: block;
      margin-bottom: 16px;
    }

    .stage {
      width: 100%;
      overflow-x: auto;
    }

    .screen {
      transition: width 0.3s ease;
      height: 560px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
    }

    .topbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header {
      margin-bottom: 20px;
    }

    @media (prefers-reduced-motion: reduce) {
      .screen {
        transition: none;
      }
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppLayoutResponsiveExample {
  readonly devices: TxTabItem[] = [
    { value: 'phone', label: 'Phone', icon: 'mobile' },
    { value: 'tablet', label: 'Tablet', icon: 'tablet' },
    { value: 'desktop', label: 'Desktop', icon: 'desktop' },
  ];
  readonly device = signal<TxTabValue | undefined>('phone');
  readonly width = computed(
    () => ({ phone: '375px', tablet: '820px' })[String(this.device())] ?? '1180px',
  );
  readonly page = signal('Dashboard');
  readonly menu = computed<TxPanelMenuItem[]>(() => [
    {
      label: 'Main',
      items: [
        this.link('Dashboard', 'home'),
        { ...this.link('Notifications', 'bell'), badge: 4 },
        this.link('Reports', 'chart-bar'),
      ],
    },
    {
      label: 'Workspace',
      items: [
        this.link('Team', 'users'),
        this.link('Settings', 'cog'),
        { label: 'Billing', icon: 'credit-card', disabled: true },
      ],
    },
  ]);

  private link(label: string, icon: string): TxPanelMenuItem {
    return { label, icon, active: this.page() === label, command: () => this.page.set(label) };
  }
}
