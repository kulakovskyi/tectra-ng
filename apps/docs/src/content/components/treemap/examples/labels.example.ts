import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxTreemap, TxTreemapItem } from '@tectra-ng/charts/treemap';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'treemap-labels-example',
  imports: [TxTreemap, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <tx-toggle-switch label="Names" [(ngModel)]="names" />
        <tx-toggle-switch label="Values" [(ngModel)]="values" />
      </div>
      <tx-treemap
        [items]="files"
        [height]="300"
        [showDataLabels]="names()"
        [showValues]="values()"
        valueFormat="compact"
        ariaLabel="Disk usage by folder"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreemapLabelsExample {
  readonly names = signal(true);
  readonly values = signal(true);
  readonly files: TxTreemapItem[] = [
    { label: 'videos', value: 48200 },
    { label: 'photos', value: 21500 },
    { label: 'backups', value: 15800 },
    { label: 'documents', value: 6400 },
    { label: 'music', value: 3900 },
    { label: 'downloads', value: 1800 },
    { label: 'fonts', value: 420 },
    { label: 'notes', value: 160 },
    { label: 'keys', value: 40 },
  ];
}
