import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxGalleria, TxGalleriaImage, TxGalleriaPosition } from '@tectra-ng/ui/galleria';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'galleria-indicators-example',
  imports: [TxGalleria, TxTabs, TxToggleSwitch, FormsModule],
  template: `
    <div class="controls">
      <tx-tabs [tabs]="positions" [(value)]="choice" />
      <span class="switch">
        <tx-toggle-switch [(ngModel)]="onItem" inputId="indicators-on-item" />
        <label for="indicators-on-item">On the image</label>
      </span>
    </div>
    <tx-galleria
      [value]="photos"
      [showThumbnails]="false"
      showIndicators
      changeItemOnIndicatorHover
      [showIndicatorsOnItem]="onItem()"
      [indicatorsPosition]="position()"
    />
  `,
  styles: `
    tx-galleria {
      max-width: 640px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
    }
    .switch {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GalleriaIndicatorsExample {
  readonly photos: TxGalleriaImage[] = [
    {
      src: 'images/gallery/dawn.svg',
      alt: 'Dawn over the ridge',
      title: 'Dawn over the ridge',
      description: 'First light on the eastern slopes.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/lake.svg',
      alt: 'Alpine lake',
      title: 'Alpine lake',
      description: 'Still water under the north face.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/dunes.svg',
      alt: 'Desert dunes',
      title: 'Desert dunes',
      description: 'Wind-shaped sand at noon.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/forest.svg',
      alt: 'Pine forest',
      title: 'Pine forest',
      description: 'Rolling hills of evergreen trees.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/night.svg',
      alt: 'Night sky',
      title: 'Night sky',
      description: 'A clear sky far from the city.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/coast.svg',
      alt: 'Quiet coast',
      title: 'Quiet coast',
      description: 'Low tide in a sheltered bay.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/autumn.svg',
      alt: 'Autumn hills',
      title: 'Autumn hills',
      description: 'Warm colours late in October.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/arctic.svg',
      alt: 'Arctic morning',
      title: 'Arctic morning',
      description: 'Pale light over the ice fields.',
      width: 1200,
      height: 800,
    },
  ];
  readonly positions: TxTabItem[] = [
    { value: 'bottom', label: 'Bottom' },
    { value: 'top', label: 'Top' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ];
  readonly choice = signal<TxTabValue | undefined>('bottom');
  readonly position = computed(() => (this.choice() ?? 'bottom') as TxGalleriaPosition);
  readonly onItem = signal(true);
}
