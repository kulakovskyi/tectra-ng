import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScrollPanel } from '@tectra-ng/ui/scroll-panel';

@Component({
  selector: 'scroll-panel-basic-example',
  imports: [TxScrollPanel],
  template: `
    <tx-scroll-panel class="panel" ariaLabel="Release notes">
      @for (release of releases; track release.version) {
        <section class="release">
          <h3 class="title">Version {{ release.version }}</h3>
          <p class="text">{{ release.notes }}</p>
        </section>
      }
    </tx-scroll-panel>
  `,
  styles: `
    .panel {
      height: 220px;
    }

    .release {
      padding: 0 16px 12px 0;
    }

    .title {
      margin: 0 0 4px;
      font-size: inherit;
    }

    .text {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScrollPanelBasicExample {
  readonly releases = [
    { version: '3.4', notes: 'Faster search across large projects and a new compact list view.' },
    { version: '3.3', notes: 'Saved filters can be shared with the whole team.' },
    { version: '3.2', notes: 'Keyboard shortcuts for every action in the editor.' },
    { version: '3.1', notes: 'Exports keep the column order and the applied sorting.' },
    { version: '3.0', notes: 'A redesigned dashboard with widgets you can rearrange.' },
    { version: '2.9', notes: 'Comments support mentions and notify the people mentioned.' },
    { version: '2.8', notes: 'Dark theme follows the system setting by default.' },
    { version: '2.7', notes: 'Bulk editing for tags, owners and due dates.' },
  ];
}
