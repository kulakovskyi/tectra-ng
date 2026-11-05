import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTooltip } from '@tectra/ui/tooltip';

@Component({
  selector: 'tooltip-overflow-example',
  imports: [TxTooltip],
  template: `
    <ul class="pages">
      @for (page of pages; track page) {
        <li>
          <a
            href="#"
            class="title"
            [txTooltip]="page"
            tooltipOverflowOnly
            (click)="$event.preventDefault()"
          >
            {{ page }}
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    .pages {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 6px;
      width: 260px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .title {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: var(--tx-primary-soft-text);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipOverflowExample {
  readonly pages = [
    'Pricing',
    'How to choose a running shoe for long distances on trails and roads',
    'Contact us',
    'Ten questions to ask before you sign a lease for a small office',
  ];
}
