import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAvatarEditor } from '@tectra-ng/ui/avatar';

@Component({
  selector: 'avatar-editor-square-example',
  imports: [TxAvatarEditor],
  template: `
    <tx-avatar-editor
      name="Design Team"
      shape="square"
      hint="The team logo, PNG or SVG."
      [confirmRemove]="false"
      [image]="logo()"
      (photoChange)="logo.set($event ? url($event) : null)"
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
export default class AvatarEditorSquareExample {
  readonly logo = signal<string | null>(null);

  url(file: File): string {
    return URL.createObjectURL(file);
  }
}
