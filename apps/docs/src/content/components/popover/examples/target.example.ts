import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverContent } from '@tectra-ng/ui/popover';

interface StoredFile {
  name: string;
  size: string;
  owner: string;
  updated: string;
}

@Component({
  selector: 'popover-target-example',
  imports: [TxPopover, TxPopoverContent, TxButton],
  template: `
    <ul class="files">
      @for (file of files; track file.name) {
        <li>
          <span>{{ file.name }}</span>
          <button
            txButton
            icon="info-circle"
            size="small"
            severity="secondary"
            [text]="true"
            aria-haspopup="dialog"
            [attr.aria-label]="'Details of ' + file.name"
            (click)="selected.set(file); details.toggle($event)"
          ></button>
        </li>
      }
    </ul>
    <tx-popover #details placement="right-start" [header]="selected().name">
      <ng-template txPopoverContent>
        <dl class="details">
          <dt>Size</dt>
          <dd>{{ selected().size }}</dd>
          <dt>Owner</dt>
          <dd>{{ selected().owner }}</dd>
          <dt>Updated</dt>
          <dd>{{ selected().updated }}</dd>
        </dl>
      </ng-template>
    </tx-popover>
  `,
  styles: `
    .files {
      display: grid;
      gap: 4px;
      max-width: 320px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .files li {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .details {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 4px 16px;
      margin: 0;
    }
    .details dt {
      color: var(--tx-text-muted);
    }
    .details dd {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverTargetExample {
  readonly files: StoredFile[] = [
    { name: 'Q3 report.pdf', size: '2.4 MB', owner: 'Olena Koval', updated: '2 Nov' },
    { name: 'Roadmap.xlsx', size: '310 KB', owner: 'Marek Nowak', updated: '28 Oct' },
    { name: 'Logo.svg', size: '12 KB', owner: 'Sara Lind', updated: '14 Sep' },
  ];
  readonly selected = signal(this.files[0]);
}
