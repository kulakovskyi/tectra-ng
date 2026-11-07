import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { TxFileUpload, TxFileUploadHandlerEvent } from '@tectra-ng/ui/file-upload';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'file-upload-upload-example',
  imports: [TxFileUpload],
  template: `
    <tx-file-upload
      multiple
      [customUpload]="true"
      description="Add a few files and press Upload — PDF files fail"
      (uploadHandler)="send($event)"
      (uploaded)="toast.success('Uploaded ' + $event.files.length + ' file(s)')"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadUploadExample {
  readonly toast = inject(TxToastService);

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
          if (file.name.toLowerCase().endsWith('.pdf')) {
            event.fail('The server refused this file', file);
          } else {
            event.complete(file);
          }
        }
      }, 120);
      this.timers.add(timer);
    }
  }
}
