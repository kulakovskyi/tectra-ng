import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxPublicHeader } from '@tectra-ng/blocks/public-header';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';

@Component({
  selector: 'public-header-basic-example',
  imports: [RouterLink, TxPublicHeader, TxButton, TxCard],
  template: `
    <div class="screen">
      <tx-public-header brand="Northwind" logo="/favicon.svg">
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
      <main class="page">
        <h2>Ship reports your team reads</h2>
        <p>Scroll this frame: the header stays on top and the content shows through its glass.</p>
        <div class="cards">
          @for (card of cards; track card) {
            <tx-card [title]="card" subtitle="Ready in a minute" />
          }
        </div>
      </main>
    </div>
  `,
  styles: `
    .screen {
      width: 100%;
      height: 420px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      background: var(--tx-surface-ground);
    }

    .page {
      padding: 28px 18px;
    }

    h2 {
      margin: 0 0 8px;
    }

    p {
      margin: 0 0 20px;
      color: var(--tx-text-muted);
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PublicHeaderBasicExample {
  readonly cards = [
    'Dashboards',
    'Alerts',
    'Exports',
    'Sharing',
    'Schedules',
    'Comments',
    'Goals',
    'Forecasts',
    'Audit log',
  ];
}
