import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar } from '@tectra/ui/avatar';

@Component({
  selector: 'avatar-initials-example',
  imports: [TxAvatar],
  template: `
    <div class="row">
      @for (name of names; track name) {
        <tx-avatar [name]="name" />
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarInitialsExample {
  readonly names = [
    'Iryna Bondar',
    'Maksym Ivanenko',
    'Sofia Melnyk',
    'Andrii Koval',
    'Daria Lysenko',
    'Yurii Tkachenko',
    'nora.white@example.com',
  ];
}
