import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxMenuItem } from '@tectra/ui/menu';
import { TxSpeedDial } from '@tectra/ui/speed-dial';

@Component({
  selector: 'speed-dial-basic-example',
  imports: [TxSpeedDial],
  template: `
    <div class="stage">
      <p class="last">Created: {{ last() }}</p>
      <tx-speed-dial
        ariaLabel="Create"
        [model]="items"
        (itemSelected)="last.set($event.item.label ?? '')"
      />
    </div>
  `,
  styles: `
    .stage {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 220px;
    }
    .last {
      margin: 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SpeedDialBasicExample {
  readonly last = signal('—');
  readonly items: TxMenuItem[] = [
    { label: 'Note', icon: 'pencil' },
    { label: 'Event', icon: 'calendar' },
    { label: 'Photo', icon: 'camera' },
  ];
}
