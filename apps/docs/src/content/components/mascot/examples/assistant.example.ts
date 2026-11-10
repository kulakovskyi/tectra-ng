import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TxMascot, TxMascotState } from '@tectra-ng/blocks/mascot';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'mascot-assistant-example',
  imports: [TxMascot, TxButton],
  template: `
    <div class="assistant">
      <tx-mascot label="Assistant" [state]="state()" [size]="56" />
      <div class="body">
        <p class="message" aria-live="polite">{{ message() }}</p>
        <button
          txButton
          label="Summarize the report"
          icon="sparkles"
          size="small"
          [loading]="state() === 'thinking'"
          (click)="ask()"
        ></button>
      </div>
    </div>
  `,
  styles: `
    .assistant {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .body {
      display: grid;
      justify-items: start;
      gap: 10px;
    }

    .message {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MascotAssistantExample {
  private timers: ReturnType<typeof setTimeout>[] = [];
  readonly state = signal<TxMascotState>('idle');
  readonly message = signal('Ask me to summarize the quarterly report.');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  ask(): void {
    this.state.set('thinking');
    this.message.set('Reading the report…');
    this.timers.push(
      setTimeout(() => {
        this.state.set('happy');
        this.message.set('Revenue grew 12%, costs stayed flat, and two new markets opened.');
      }, 2000),
      setTimeout(() => this.state.set('idle'), 5000),
    );
  }
}
