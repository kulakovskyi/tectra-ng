import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxLink } from '@tectra/ui/link';

@Component({
  selector: 'link-router-link-example',
  imports: [TxLink],
  template: `
    <p class="text">
      Read about <tx-link link="buttons" [routerLink]="['/components', 'button']" /> and
      <tx-link link="avatars" routerLink="/components/avatar" />.
    </p>
  `,
  styles: `
    .text {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkRouterLinkExample {}
