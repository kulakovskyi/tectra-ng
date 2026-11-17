import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxWizardDirection, TxWizardFooter, TxWizardScene } from '@tectra-ng/blocks/wizard';
import { TxIcon } from '@tectra-ng/icons';

interface Tip {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'wizard-own-scenes-example',
  imports: [TxWizardScene, TxWizardFooter, TxIcon],
  template: `
    <div class="tour">
      <div class="stage" aria-live="polite">
        @for (tip of shown(); track tip.title) {
          <figure
            txWizardScene
            class="tip"
            [direction]="direction()"
            animate.enter="tx-wizard-scene--enter"
            animate.leave="tx-wizard-scene--leave"
          >
            <tx-icon class="icon" [name]="tip.icon" />
            <figcaption>
              <strong>{{ tip.title }}</strong>
              <span>{{ tip.text }}</span>
            </figcaption>
          </figure>
        }
      </div>
      <tx-wizard-footer
        [showBack]="index() > 0"
        [nextLabel]="index() === tips.length - 1 ? 'Start over' : ''"
        (back)="go(-1)"
        (next)="go(1)"
      />
    </div>
  `,
  styles: `
    .tour {
      display: flex;
      flex-direction: column;
      gap: 21px;
      width: 100%;
      max-width: 420px;
    }

    .stage {
      display: grid;
      overflow: clip;
      border-radius: var(--tx-radius-lg);
      background: var(--tx-surface-ground);
    }

    .tip {
      display: flex;
      grid-area: 1 / 1;
      align-items: center;
      gap: 14px;
      margin: 0;
      padding: 21px;
    }

    .icon {
      color: var(--tx-primary-base);
      font-size: 28px;
    }

    figcaption {
      display: flex;
      flex-direction: column;
      gap: 3.5px;
      color: var(--tx-text-muted);
    }

    strong {
      color: var(--tx-text-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WizardOwnScenesExample {
  readonly tips: Tip[] = [
    { icon: 'search', title: 'Find anything', text: 'Press Ctrl K to search pages and records.' },
    {
      icon: 'filter',
      title: 'Narrow the list',
      text: 'Pick the filters you use and drag them in order.',
    },
    { icon: 'download', title: 'Take it with you', text: 'Export any table as CSV or PDF.' },
  ];
  readonly index = signal(0);
  readonly direction = signal<TxWizardDirection>('forward');
  readonly shown = computed(() => [this.tips[this.index()]]);

  go(step: number): void {
    this.direction.set(step > 0 ? 'forward' : 'back');
    this.index.update((index) => (index + step + this.tips.length) % this.tips.length);
  }
}
