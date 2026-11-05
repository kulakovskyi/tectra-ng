import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAvatar } from '@tectra/ui/avatar';

@Component({
  selector: 'avatar-fallback-example',
  imports: [TxAvatar],
  template: `
    <div class="row">
      <tx-avatar
        image="/missing-photo.png"
        name="Kateryna Moroz"
        size="large"
        (imageError)="failed.set(true)"
      />
      <span class="hint">{{
        failed() ? 'The photo failed — initials instead' : 'Loading the photo…'
      }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarFallbackExample {
  readonly failed = signal(false);
}
