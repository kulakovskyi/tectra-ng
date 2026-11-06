import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxMenuItem, TxMenuItemEvent } from '@tectra-ng/ui/menu';
import { TxSpeedDial } from '@tectra-ng/ui/speed-dial';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'speed-dial-basic-example',
  imports: [TxSpeedDial],
  template: `
    <div class="stage">
      <tx-speed-dial ariaLabel="Create" [model]="items" (itemSelected)="created($event)" />
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
export default class SpeedDialBasicExample {
  private readonly toast = inject(TxToastService);
  readonly items: TxMenuItem[] = [
    { label: 'Note', icon: 'pencil' },
    { label: 'Event', icon: 'calendar' },
    { label: 'Photo', icon: 'camera' },
  ];

  created(event: TxMenuItemEvent): void {
    this.toast.success(`${event.item.label} created`);
  }
}
