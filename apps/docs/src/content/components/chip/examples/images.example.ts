import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChip } from '@tectra-ng/ui/chip';

@Component({
  selector: 'chip-images-example',
  imports: [TxChip],
  template: `
    <div class="row">
      @for (person of people; track person.name) {
        <tx-chip [label]="person.name" [image]="person.image" alt="" />
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipImagesExample {
  private face(background: string, text: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${background}"/><text x="20" y="25" font-family="sans-serif" font-size="15" font-weight="600" fill="white" text-anchor="middle">${text}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  readonly people = [
    { name: 'Olena Kovalenko', image: this.face('#0f766e', 'OK') },
    { name: 'Taras Shevchuk', image: this.face('#7c3aed', 'TS') },
    { name: 'Iryna Bondar', image: this.face('#c2410c', 'IB') },
  ];
}
