import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxGalleria, TxGalleriaImage, TxGalleriaResponsiveOption } from '@tectra-ng/ui/galleria';

@Component({
  selector: 'galleria-autoplay-example',
  imports: [TxGalleria, TxButton],
  template: `
    <tx-galleria
      #gallery
      [value]="photos"
      [numVisible]="5"
      [responsiveOptions]="responsive"
      autoPlay
      [transitionInterval]="3000"
      circular
    />
    <div class="actions">
      <button txButton size="small" severity="secondary" icon="play" (click)="play()">Play</button>
      <button txButton size="small" severity="secondary" icon="pause" (click)="pause()">
        Pause
      </button>
      <span class="status">{{ playing() ? 'Playing' : 'Paused' }}</span>
    </div>
  `,
  styles: `
    tx-galleria {
      max-width: 640px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
    }
    .status {
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GalleriaAutoplayExample {
  readonly responsive: TxGalleriaResponsiveOption[] = [
    { breakpoint: '768px', numVisible: 4 },
    { breakpoint: '560px', numVisible: 3 },
  ];
  readonly gallery = viewChild.required(TxGalleria);
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
  readonly playing = signal(true);

  play(): void {
    this.gallery().startAutoplay();
    this.playing.set(true);
  }

  pause(): void {
    this.gallery().stopAutoplay();
    this.playing.set(false);
  }
}
