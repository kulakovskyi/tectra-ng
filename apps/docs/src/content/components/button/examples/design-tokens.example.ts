import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

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
      primary: {
        background: '#0f766e',
        hoverBackground: '#115e59',
        activeBackground: '#134e4a',
        borderColor: '#0f766e',
        hoverBorderColor: '#115e59',
        activeBorderColor: '#134e4a',
        color: '#ffffff',
        hoverColor: '#ffffff',
        activeColor: '#ffffff',
      },
    },
  };
  chunky = {
    root: { borderRadius: '2px', paddingX: '24px', paddingY: '14px', label: { fontWeight: '800' } },
  };
}
