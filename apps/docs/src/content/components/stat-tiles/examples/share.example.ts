import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-share-example',
  imports: [TxStatTiles, TxStatTile, TxButton],
  template: `
    <tx-stat-tiles ariaLabel="Disk usage">
      <tx-stat-tile
        label="Images"
        icon="image"
        tone="info"
        [value]="images()"
        unit="GB"
        [share]="images() * 2"
        meta="of 50 GB"
      />
      <tx-stat-tile
        label="Backups"
        icon="database"
        tone="warn"
        [value]="backups()"
        unit="GB"
        [share]="backups() * 2"
        meta="of 50 GB"
      />
      <tx-stat-tile
        label="Free"
        icon="check-circle"
        tone="success"
        [value]="free()"
        unit="GB"
        [share]="free() * 2"
        meta="of 50 GB"
      />
    </tx-stat-tiles>
    <button
      txButton
      label="Upload 5 GB of images"
      variant="outlined"
      [disabled]="free() < 5"
      (click)="upload()"
    ></button>
  `,
  styles: `
    :host {
      display: grid;
      gap: 16px;
      justify-items: start;
    }
    tx-stat-tiles {
      justify-self: stretch;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesShareExample {
  readonly images = signal(18);
  readonly backups = signal(12);
  readonly free = signal(20);

  upload(): void {
    this.images.update((value) => value + 5);
    this.free.update((value) => value - 5);
  }
}
