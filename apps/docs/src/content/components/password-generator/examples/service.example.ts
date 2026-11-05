import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxPasswordGenerator } from '@tectra/ui/password-generator';

@Component({
  selector: 'password-generator-service-example',
  imports: [TxButton],
  template: `
    <div class="row">
      <button txButton severity="secondary" (click)="invite()">Create invite code</button>
      <code>{{ code() || '—' }}</code>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordGeneratorServiceExample {
  private generator = inject(TxPasswordGenerator);
  readonly code = signal('');

  invite(): void {
    this.code.set(
      this.generator.generate({
        length: 10,
        lowercase: false,
        symbols: false,
        excludeSimilar: true,
      }),
    );
  }
}
