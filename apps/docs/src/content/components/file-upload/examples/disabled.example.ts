import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFileUpload } from '@tectra-ng/ui/file-upload';

@Component({
  selector: 'file-upload-disabled-example',
  imports: [TxFileUpload],
  template: `<tx-file-upload disabled description="Uploads are paused during maintenance" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadDisabledExample {}
