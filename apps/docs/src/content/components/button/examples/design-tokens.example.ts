import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-design-tokens-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [dt]="teal">Teal button</button>
      <button txButton [dt]="chunky" [icon]="'plus'">Chunky</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonDesignTokensExample {
  teal = {
    root: {
      primary: { background: '#0d9488', hoverBackground: '#0f766e', activeBackground: '#115e59', borderColor: '#0d9488', hoverBorderColor: '#0f766e', activeBorderColor: '#115e59' },
    },
  };
  chunky = { root: { borderRadius: '2px', paddingX: '24px', paddingY: '14px', label: { fontWeight: '800' } } };
}
