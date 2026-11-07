import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxGalleria, TxGalleriaImage, TxGalleriaResponsiveOption } from '@tectra-ng/ui/galleria';

@Component({
  selector: 'galleria-full-screen-example',
  imports: [TxGalleria],
  template: `
    <div class="grid">
      @for (photo of photos; track photo.src; let index = $index) {
        <button
          type="button"
          class="tile"
          [attr.aria-label]="'Open ' + photo.title"
          (click)="open(index)"
        >
          <img [src]="photo.src" alt="" />
        </button>
      }
    </div>
    <tx-galleria
      fullScreen
      [value]="photos"
      [(visible)]="visible"
      [(activeIndex)]="active"
      [numVisible]="7"
      [responsiveOptions]="responsive"
      showItemNavigators
      circular
    />
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
      max-width: 640px;
    }
    .tile {
      padding: 0;
      border: 0;
      border-radius: 10px;
      overflow: hidden;
      cursor: zoom-in;
    }
    .tile:focus-visible {
      outline: 2px solid var(--tx-focus-ring-color);
      outline-offset: 2px;
    }
    .tile img {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GalleriaFullScreenExample {
  readonly responsive: TxGalleriaResponsiveOption[] = [
    { breakpoint: '1024px', numVisible: 5 },
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
  readonly visible = signal(false);
  readonly active = signal(0);

  open(index: number): void {
    this.active.set(index);
    this.visible.set(true);
  }
}
