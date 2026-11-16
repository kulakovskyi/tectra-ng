import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSpeedDial } from '@tectra-ng/ui/speed-dial';

@Component({
  selector: 'speed-dial-links-example',
  imports: [TxSpeedDial],
  template: `
    <div class="stage">
      <tx-speed-dial ariaLabel="Go to" showIcon="compass" [model]="items" />
    </div>
  `,
  styles: `
    .stage {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      height: 220px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SpeedDialLinksExample {
  readonly items: TxMenuItem[] = [
    { label: 'Getting started', icon: 'home', routerLink: '/getting-started' },
    { label: 'Theming', icon: 'palette', routerLink: '/theming' },
    { label: 'Help center', icon: 'question-circle', url: 'https://example.com', target: '_blank' },
  ];
}
