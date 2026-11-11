import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxRadialBar,
  TxRadialBarEvent,
  TxRadialBarItem,
  TxRadialBarToggle,
} from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-events-example',
  imports: [TxRadialBar],
  template: `
    <div class="wrap">
      <tx-radial-bar
        [items]="items"
        [height]="260"
        ariaLabel="Release checklist"
        (barClick)="onBar($event)"
        (barToggle)="onToggle($event)"
      />
      <p class="log" aria-live="polite">{{ message() }}</p>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 8px;
      width: 100%;
    }
    .log {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarEventsExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'Tests', value: 96 },
    { label: 'Docs', value: 70 },
    { label: 'Translations', value: 35 },
  ];
  readonly message = signal('Click a ring or a legend item.');

  onBar(event: TxRadialBarEvent): void {
    this.message.set(`${event.label}: ${event.value} (${Math.round(event.share * 100)}%)`);
  }

  onToggle(event: TxRadialBarToggle): void {
    this.message.set(`${event.label} is ${event.hidden ? 'hidden' : 'shown'}`);
  }
}
