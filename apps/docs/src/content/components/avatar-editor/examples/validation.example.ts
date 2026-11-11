import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxAvatarEditor, TxAvatarEditorRejection } from '@tectra-ng/ui/avatar';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'avatar-editor-validation-example',
  imports: [TxAvatarEditor],
  template: `
    <tx-avatar-editor
      name="Marko Petrenko"
      accept=".png,.jpg,.jpeg"
      hint="PNG or JPG, up to 200 KB. Drop a file on the photo or use the button."
      [size]="96"
      [maxFileSize]="200 * 1024"
      [image]="photo()"
      (photoChange)="photo.set($event ? url($event) : null)"
      (rejected)="warn($event)"
    />
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 16px 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarEditorValidationExample {
  private readonly toast = inject(TxToastService);
  readonly photo = signal<string | null>(null);

  url(file: File): string {
    return URL.createObjectURL(file);
  }

  warn({ file, reason }: TxAvatarEditorRejection): void {
    this.toast.warn(
      reason === 'size'
        ? `“${file.name}” is larger than 200 KB`
        : `“${file.name}” is not a PNG or JPG`,
    );
  }
}
