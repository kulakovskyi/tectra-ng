import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TxAvatarEditor } from '@tectra-ng/ui/avatar';

const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#ea580c"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="40" cy="32" r="14" fill="#fff7ed"/><path d="M14 80c4-18 16-26 26-26s22 8 26 26z" fill="#fff7ed"/></svg>',
)}`;

@Component({
  selector: 'avatar-editor-basic-example',
  imports: [TxAvatarEditor],
  template: `
    <tx-avatar-editor
      name="Olena Kovalenko"
      hint="JPG or PNG. The photo is shown to your team."
      [image]="photo()"
      [loading]="saving()"
      (photoChange)="save($event)"
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
export default class AvatarEditorBasicExample {
  readonly photo = signal<string | null>(PHOTO);
  readonly saving = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  save(file: File | null): void {
    this.saving.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.photo.set(file ? URL.createObjectURL(file) : null);
      this.saving.set(false);
    }, 900);
  }
}
