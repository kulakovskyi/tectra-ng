import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPinnedTabs } from '@tectra-ng/blocks/pinned-tabs';

@Component({
  selector: 'pinned-tabs-raised-example',
  imports: [TxPinnedTabs],
  template: `
    <div class="ground">
      <tx-pinned-tabs
        raised
        stateKey="docs-pinned-tabs-raised"
        ariaLabel="Projects"
        allLabel="All projects"
        [options]="projects"
        [defaultPinned]="['website', 'mobile']"
        [(selected)]="selected"
      />
    </div>
  `,
  styles: `
    .ground {
      width: 100%;
      padding: 16px;
      border-radius: var(--tx-content-radius);
      background: var(--tx-surface-ground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PinnedTabsRaisedExample {
  readonly projects = [
    { value: 'website', label: 'Website' },
    { value: 'mobile', label: 'Mobile app' },
    { value: 'billing', label: 'Billing' },
    { value: 'reports', label: 'Reports' },
  ];
  readonly selected = signal<readonly string[]>([]);
}
