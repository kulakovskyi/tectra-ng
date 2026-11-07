import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxFileUpload } from '@tectra-ng/ui/file-upload';

@Component({
  selector: 'file-upload-multiple-example',
  imports: [TxFileUpload],
  template: `
    <tx-file-upload
      multiple
      [fileLimit]="5"
      description="Up to 5 files of any type"
      [(files)]="files"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadMultipleExample {
  readonly files = signal<File[]>([]);
}
