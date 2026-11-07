import { Directive, TemplateRef, inject } from '@angular/core';
import { TxFileUploadDropzoneContext, TxFileUploadFileContext } from './file-upload.types';

@Directive({ selector: 'ng-template[txFileUploadFile]' })
export class TxFileUploadFileTemplate {
  readonly template = inject<TemplateRef<TxFileUploadFileContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxFileUploadFileTemplate, context: unknown): context is TxFileUploadFileContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txFileUploadDropzone]' })
export class TxFileUploadDropzoneTemplate {
  readonly template = inject<TemplateRef<TxFileUploadDropzoneContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxFileUploadDropzoneTemplate, context: unknown): context is TxFileUploadDropzoneContext {
    return !!context;
  }
}

@Directive({ selector: '[txFileUploadActions]' })
export class TxFileUploadActions {}
