import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatarEditor } from '@tectra-ng/ui/avatar';
import { TectraAvatarTokens, TectraDeepPartial } from '@tectra-ng/themes';

@Component({
  selector: 'avatar-editor-design-tokens-example',
  imports: [TxAvatarEditor],
  template: ` <tx-avatar-editor name="Iryna Bondar" [dt]="tokens" /> `,
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
export default class AvatarEditorDesignTokensExample {
  readonly tokens: TectraDeepPartial<TectraAvatarTokens> = {
    editor: {
      size: '88px',
      ringWidth: '2px',
      ringColor: 'var(--tx-primary-base)',
      badgeSize: '26px',
    },
  };
}
