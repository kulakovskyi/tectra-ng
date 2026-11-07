import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxSwapEffect } from '@tectra-ng/core/utils';
import { TxGalleria, TxGalleriaImage, TxGalleriaResponsiveOption } from '@tectra-ng/ui/galleria';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'galleria-effects-example',
  imports: [TxGalleria, TxTabs],
  template: `
    <tx-tabs [tabs]="effects" [(value)]="choice" />
    <tx-galleria
      [value]="photos"
      [numVisible]="5"
      [responsiveOptions]="responsive"
      [effect]="effect()"
      showItemNavigators
      circular
    />
  `,
  styles: `
    tx-tabs {
      margin-bottom: 12px;
    }
    tx-galleria {
      max-width: 640px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GalleriaEffectsExample {
  readonly responsive: TxGalleriaResponsiveOption[] = [
    { breakpoint: '768px', numVisible: 4 },
    { breakpoint: '560px', numVisible: 3 },
  ];
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
  readonly effects: TxTabItem[] = [
    { value: 'slide', label: 'Slide' },
    { value: 'fade', label: 'Fade' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'blur', label: 'Blur' },
    { value: 'flip', label: 'Flip' },
    { value: 'none', label: 'None' },
  ];
  readonly choice = signal<TxTabValue | undefined>('slide');
  readonly effect = computed(() => (this.choice() ?? 'slide') as TxSwapEffect);
}
