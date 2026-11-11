import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';
import { readTextStream } from '@tectra-ng/utils/stream';

const ANSWER =
  'Sales grew 12% in the third quarter. Most of it came from the new team plan, while churn stayed flat at 2.1%. The biggest risk is the slower onboarding of large accounts.';

function fakeStream(text: string): Response {
  const encoder = new TextEncoder();
  const words = text.split(/(?<= )/);
  let index = 0;
  return new Response(
    new ReadableStream<Uint8Array>({
      pull(controller) {
        return new Promise((resolve) =>
          setTimeout(() => {
            if (index < words.length) {
              controller.enqueue(encoder.encode(words[index++]));
            } else {
              controller.close();
            }
            resolve();
          }, 60),
        );
      },
    }),
  );
}

@Component({
  selector: 'stream-basic-example',
  imports: [TxButton, TxCard],
  template: `
    <div class="layout">
      <div>
        <button
          txButton
          icon="sparkles"
          label="Summarize the report"
          [loading]="busy()"
          (click)="ask()"
        ></button>
      </div>
      <tx-card>
        <p class="answer" aria-live="polite">{{ answer() || 'The answer appears here.' }}</p>
      </tx-card>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 520px;
    }
    .answer {
      margin: 0;
      min-height: 4.8em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StreamBasicExample {
  readonly answer = signal('');
  readonly busy = signal(false);

  async ask(): Promise<void> {
    this.busy.set(true);
    this.answer.set('');
    await readTextStream(fakeStream(ANSWER), (_, text) => this.answer.set(text));
    this.busy.set(false);
  }
}
