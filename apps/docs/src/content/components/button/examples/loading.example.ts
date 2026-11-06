import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-loading-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [icon]="'check'" [loading]="isSaving()" (click)="save()">Save</button>
      <button
        txButton
        [icon]="'refresh'"
        [severity]="'secondary'"
        [loading]="isSaving()"
        (click)="save()"
        aria-label="Refresh"
      ></button>
      <button txButton [outlined]="true" [loading]="isSaving()" (click)="save()">Sync</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonLoadingExample {
  isSaving = signal(false);

  save(): void {
    this.isSaving.set(true);
    setTimeout(() => this.isSaving.set(false), 2000);
  }
}
