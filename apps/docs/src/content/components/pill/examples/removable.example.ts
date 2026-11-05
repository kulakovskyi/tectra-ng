import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxPill } from '@tectra/ui/pill';

@Component({
  selector: 'pill-removable-example',
  imports: [TxPill, TxButton],
  template: `
    <div class="row">
      @for (tag of tags(); track tag) {
        <tx-pill
          tone="primary"
          [removable]="true"
          [removeLabel]="'Remove ' + tag"
          (removed)="remove(tag)"
          >{{ tag }}</tx-pill
        >
      } @empty {
        <button txButton size="small" [text]="true" (click)="reset()">Bring the tags back</button>
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      min-height: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PillRemovableExample {
  private readonly all = ['design', 'frontend', 'accessibility', 'research'];
  readonly tags = signal(this.all);

  remove(tag: string): void {
    this.tags.update((tags) => tags.filter((item) => item !== tag));
  }

  reset(): void {
    this.tags.set(this.all);
  }
}
