import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { TxFileUpload, TxFileUploadHandlerEvent } from '@tectra-ng/ui/file-upload';

@Component({
  selector: 'file-upload-auto-example',
  imports: [TxFileUpload],
  template: `
    <tx-file-upload
      multiple
      auto
      accept="image/*"
      [customUpload]="true"
      description="Images upload right away"
      (uploadHandler)="send($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadAutoExample {
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
