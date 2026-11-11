import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCard } from '@tectra-ng/ui/card';
import { TxScrollPanel } from '@tectra-ng/ui/scroll-panel';
import { TxInView } from '@tectra-ng/utils/in-view';

@Component({
  selector: 'in-view-reveal-example',
  imports: [TxCard, TxScrollPanel, TxInView],
  template: `
    <tx-scroll-panel class="box">
      <div class="cards">
        @for (step of steps; track step.title) {
          <tx-card class="card" txInView enterClass="reveal-in" [title]="step.title">
            {{ step.text }}
          </tx-card>
        }
      </div>
    </tx-scroll-panel>
  `,
  styles: `
    .box {
      height: 280px;
    }
    .cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px 12px 120px 4px;
    }
    .card {
      opacity: 0;
      transform: translateY(16px);
    }
    .card.reveal-in {
      opacity: 1;
      transform: none;
      transition:
        opacity calc(var(--tx-motion-duration) * 2) var(--tx-motion-easing),
        transform calc(var(--tx-motion-duration) * 2) var(--tx-motion-easing);
    }
    @media (prefers-reduced-motion: reduce) {
      .card {
        transform: none;
      }
      .card.reveal-in {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InViewRevealExample {
  readonly steps = [
    { title: 'Create a workspace', text: 'Name it and pick a region.' },
    { title: 'Invite the team', text: 'Send links by email or share one invite link.' },
    { title: 'Connect a domain', text: 'Point a CNAME record to the app.' },
    { title: 'Turn on backups', text: 'Daily snapshots, kept for 30 days.' },
    { title: 'Go live', text: 'Publish and watch the first visits come in.' },
  ];
}
