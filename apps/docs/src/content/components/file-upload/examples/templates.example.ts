import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import {
  TxFileUpload,
  TxFileUploadDropzoneTemplate,
  TxFileUploadFileTemplate,
} from '@tectra-ng/ui/file-upload';

@Component({
  selector: 'file-upload-templates-example',
  imports: [TxFileUpload, TxFileUploadDropzoneTemplate, TxFileUploadFileTemplate, TxIcon, TxButton],
  template: `
    <tx-file-upload
      multiple
      accept="image/*"
     
      [dt]="{ dropzone: { minHeight: '120px' } }"
    >
      <ng-template txFileUploadDropzone let-dragging>
        <span class="zone">
          <tx-icon [name]="dragging ? 'arrow-down' : 'images'" />
          {{ dragging ? 'Drop the photos' : 'Add photos to the album' }}
        </span>
      </ng-template>
      <ng-template txFileUploadFile let-entry let-remove="remove">
        <span class="chip">
          @if (entry.preview) {
            <img class="thumb" [src]="entry.preview" alt="" />
          }
          <span class="name">{{ entry.file.name }}</span>
          <button
            txButton
            text
            rounded
            size="small"
            severity="secondary"
            icon="times"
            iconOnly
            [attr.aria-label]="'Remove ' + entry.file.name"
            (click)="remove($event)"
          ></button>
        </span>
      </ng-template>
    </tx-file-upload>
  `,
  styles: `
    .zone {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .chip {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      width: 100%;
    }

    .thumb {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      object-fit: cover;
    }

    .name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadTemplatesExample {}
