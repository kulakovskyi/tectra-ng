import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPinnedTabs } from '@tectra-ng/blocks/pinned-tabs';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'pinned-tabs-default-pins-example',
  imports: [TxPinnedTabs, TxButton],
  template: `
    <div class="column">
      <tx-pinned-tabs
        #pins
        stateKey="docs-pinned-tabs-regions"
        ariaLabel="Regions"
        allLabel="All regions"
        [options]="regions"
        [defaultPinned]="['europe', 'americas']"
        [(selected)]="selected"
      />
      <div class="flex">
        <button
          txButton
          label="Pin Asia"
          icon="plus"
          severity="secondary"
          outlined
          size="small"
          (click)="pins.pin('asia')"
        ></button>
        <button
          txButton
          label="Unpin Asia"
          icon="minus"
          severity="secondary"
          outlined
          size="small"
          (click)="pins.unpin('asia')"
        ></button>
      </div>
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PinnedTabsDefaultPinsExample {
  readonly regions = [
    { value: 'europe', label: 'Europe' },
    { value: 'americas', label: 'Americas' },
    { value: 'asia', label: 'Asia' },
    { value: 'africa', label: 'Africa' },
    { value: 'oceania', label: 'Oceania' },
  ];
  readonly selected = signal<readonly string[]>([]);
}
