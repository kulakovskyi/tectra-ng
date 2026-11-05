import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar } from '@tectra/ui/avatar';

const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#ea580c"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="40" cy="32" r="14" fill="#fff7ed"/><path d="M14 80c4-18 16-26 26-26s22 8 26 26z" fill="#fff7ed"/></svg>',
)}`;

@Component({
  selector: 'avatar-basic-example',
  imports: [TxAvatar],
  template: `
    <div class="row">
      <tx-avatar [image]="photo" name="Olena Kovalenko" />
      <tx-avatar name="Taras Shevchuk" />
      <tx-avatar />
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
export default class AvatarBasicExample {
  readonly photo = PHOTO;
}
