import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxFileUpload, TxFileUploadHandlerEvent } from '@tectra-ng/ui/file-upload';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'file-upload-uploaded-files-example',
  imports: [FormsModule, TxButton, TxFileUpload, TxToggleSwitch],
  template: `
    <div class="column">
      <div class="flex">
        <tx-toggle-switch label="Keep uploaded files" [(ngModel)]="keep" />
        <button
          txButton
          label="Clear uploaded"
          severity="secondary"
          size="small"
          [disabled]="!keep()"
          (click)="uploader().clearUploaded()"
        ></button>
      </div>
      <tx-file-upload
        multiple
        auto
        [customUpload]="true"
        [keepUploaded]="keep()"
        description="Files upload right away"
        (uploadHandler)="send($event)"
      />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: var(--tx-space-3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadUploadedFilesExample {
  readonly uploader = viewChild.required(TxFileUpload);
  readonly keep = signal(false);

  private readonly timers = new Set<ReturnType<typeof setInterval>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach((timer) => clearInterval(timer)));
  }

  send(event: TxFileUploadHandlerEvent): void {
    for (const file of event.files) {
      let progress = 0;
      const timer = setInterval(() => {
        progress = Math.min(100, progress + 20);
        event.progress(progress, file);
        if (progress === 100) {
          clearInterval(timer);
          this.timers.delete(timer);
          event.complete(file);
        }
      }, 120);
      this.timers.add(timer);
    }
  }
}
