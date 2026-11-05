import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxDrawer } from '@tectra/ui/drawer';

@Component({
  selector: 'drawer-sizes-example',
  imports: [TxDrawer, TxButton],
  template: `
    <div class="row">
      @for (option of sizes; track option) {
        <button
          txButton
          severity="secondary"
          [outlined]="true"
          (click)="size.set(option); visible.set(true)"
        >
          {{ option }}
        </button>
      }
    </div>
    <tx-drawer [header]="'Size: ' + size()" [size]="size()" [(visible)]="visible">
      Presets come from the dialog tokens (<code>drawer.sm</code>, <code>drawer.md</code>,
      <code>drawer.lg</code>); any CSS length works too.
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
export default class DrawerSizesExample {
  readonly sizes = ['small', 'medium', 'large', 'full', '50vw'];
  readonly size = signal('medium');
  readonly visible = signal(false);
}
