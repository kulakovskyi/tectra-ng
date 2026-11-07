import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxFileRejection, TxFileUpload } from '@tectra-ng/ui/file-upload';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'file-upload-validation-example',
  imports: [TxFileUpload],
  template: `
    <tx-file-upload
      multiple
      accept="image/png,image/jpeg,.pdf"
      [maxFileSize]="1024 * 1024"
      [fileLimit]="3"
      description="PNG, JPEG or PDF, up to 1 MB, at most 3 files"
      (rejected)="warn($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadValidationExample {
  private readonly toast = inject(TxToastService);

  warn(rejections: TxFileRejection[]): void {
    this.toast.warn(`${rejections.length} file(s) were not added`);
  }
}
