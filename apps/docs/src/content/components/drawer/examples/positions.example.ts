import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDrawer } from '@tectra-ng/ui/drawer';
import { TxDrawerPosition } from '@tectra-ng/ui/dialog';

@Component({
  selector: 'drawer-positions-example',
  imports: [TxDrawer, TxButton],
  template: `
    <div class="row">
      @for (edge of edges; track edge) {
        <button
          txButton
          severity="secondary"
          [outlined]="true"
          (click)="position.set(edge); visible.set(true)"
        >
          {{ edge }}
        </button>
      }
    </div>
    <tx-drawer
      [header]="'From the ' + position()"
      [position]="position()"
      size="small"
      [(visible)]="visible"
    >
      Slides in from the {{ position() }} edge. Press Escape or click outside to close.
    </tx-drawer>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DrawerPositionsExample {
  readonly edges: TxDrawerPosition[] = ['left', 'right', 'top', 'bottom'];
  readonly position = signal<TxDrawerPosition>('left');
  readonly visible = signal(false);
}
