import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxEditor, TxEditorImageRejection } from '@tectra-ng/editor';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'editor-images-example',
  imports: [TxEditor],
  template: `
    <tx-editor
      [toolbar]="[['blockStyle'], ['bold', 'italic'], ['image', 'video', 'link']]"
      [maxImageSize]="3 * 1024 * 1024"
      [imageUpload]="upload"
      (imageRejected)="reject($event)"
      html="<p>Paste or drop an image here, or use the image button.</p>"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorImagesExample {
  private readonly toast = inject(TxToastService);

  readonly upload = (file: File) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => setTimeout(() => resolve(String(reader.result)), 300);
      reader.readAsDataURL(file);
    });

  reject(event: TxEditorImageRejection): void {
    this.toast.warn(event.message);
  }
}
