import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxFileUpload } from '@tectra-ng/ui/file-upload';

@Component({
  selector: 'file-upload-basic-example',
  imports: [TxFileUpload],
  template: `
    <tx-file-upload
      accept=".csv"
      [maxFileSize]="10 * 1024 * 1024"
      description="CSV, up to 10 MB"
      [(file)]="file"
    />
    <p class="note">Selected: {{ file()?.name ?? 'nothing yet' }}</p>
  `,
  styles: `
    .note {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadBasicExample {
  readonly file = signal<File | null>(null);
}
