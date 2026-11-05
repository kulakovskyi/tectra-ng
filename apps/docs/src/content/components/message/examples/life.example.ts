import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxMessage } from '@tectra/ui/message';

@Component({
  selector: 'message-life-example',
  imports: [TxMessage, TxButton],
  template: `
    <div class="list">
      <button txButton size="small" icon="check" (click)="save()">Save</button>
      @for (id of saved(); track id) {
        <tx-message
          severity="success"
          icon="check-circle"
          text="Saved — this note closes in 3 seconds."
          [life]="3000"
          (closed)="remove(id)"
        />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .list {
      display: grid;
      justify-items: start;
      gap: 12px;
    }

    tx-message {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageLifeExample {
  readonly saved = signal<number[]>([]);
  private next = 0;

  save(): void {
    this.next += 1;
    this.saved.update((ids) => [...ids, this.next]);
  }

  remove(id: number): void {
    this.saved.update((ids) => ids.filter((item) => item !== id));
  }
}
