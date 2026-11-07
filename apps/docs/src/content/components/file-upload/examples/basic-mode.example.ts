import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { TxFileUpload, TxFileUploadHandlerEvent } from '@tectra-ng/ui/file-upload';

@Component({
  selector: 'file-upload-basic-mode-example',
  imports: [TxFileUpload],
  template: `
    <div class="stack">
      <tx-file-upload
        mode="basic"
        accept="image/*"
        chooseLabel="Change photo"
        chooseIcon="camera"
      />
      <tx-file-upload
        mode="basic"
        [customUpload]="true"
        chooseLabel="Attach file"
        chooseIcon="paperclip"
        (uploadHandler)="send($event)"
      />
    </div>
  `,
  styles: `
    .stack {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadBasicModeExample {
  private readonly timers = new Set<ReturnType<typeof setInterval>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach((timer) => clearInterval(timer)));
  }

  send(event: TxFileUploadHandlerEvent): void {
    for (const [index, file] of event.files.entries()) {
      let progress = 0;
      const timer = setInterval(() => {
        progress = Math.min(100, progress + 12 + index * 3);
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
