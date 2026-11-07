import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFileUpload } from '@tectra-ng/ui/file-upload';

@Component({
  selector: 'file-upload-design-tokens-example',
  imports: [TxFileUpload],
  template: `
    <tx-file-upload
      multiple
      description="Any file"
      [dt]="{
        dropzone: {
          minHeight: '140px',
          borderRadius: '24px',
          dash: '1px 0',
          borderColor: 'var(--tx-primary-base)',
          background: 'var(--tx-highlight-background)',
        },
        icon: { borderRadius: 'var(--tx-radius-full)' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadDesignTokensExample {}
