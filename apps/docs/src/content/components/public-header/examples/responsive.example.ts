import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxPublicHeader } from '@tectra-ng/blocks/public-header';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'public-header-responsive-example',
  imports: [RouterLink, TxPublicHeader, TxButton, TxTabs],
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
        <tx-public-header brand="Northwind" logo="/favicon.svg" responsive="container">
          <nav txPublicHeaderNav aria-label="Main">
            <a routerLink="." [queryParams]="{ section: 'features' }">Features</a>
            <a routerLink="." [queryParams]="{ section: 'pricing' }">Pricing</a>
            <a routerLink="." [queryParams]="{ section: 'docs' }">Docs</a>
          </nav>
          <div txPublicHeaderActions>
            <button txButton text severity="secondary">Sign in</button>
            <button txButton>Get started</button>
          </div>
        </tx-public-header>
        <p class="page">
          Open the menu on the phone: the links, the preferences and the buttons move into a panel.
        </p>
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
      height: 520px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      background: var(--tx-surface-ground);
      transition: width 0.3s ease;
    }

    .page {
      margin: 0;
      padding: 28px 18px;
      color: var(--tx-text-muted);
    }

    @media (prefers-reduced-motion: reduce) {
      .screen {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PublicHeaderResponsiveExample {
  readonly devices: TxTabItem[] = [
    { value: 'phone', label: 'Phone', icon: 'mobile' },
    { value: 'tablet', label: 'Tablet', icon: 'tablet' },
    { value: 'desktop', label: 'Desktop', icon: 'desktop' },
  ];
  readonly device = signal<TxTabValue | undefined>('phone');
  readonly width = computed(
    () => ({ phone: '375px', tablet: '820px' })[String(this.device())] ?? '1180px',
  );
}
