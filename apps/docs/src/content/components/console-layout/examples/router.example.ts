import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, IsActiveMatchOptions } from '@angular/router';
import { TxConsoleLayout, TxConsoleRailItem } from '@tectra-ng/blocks/console-layout';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { map } from 'rxjs';

const page = '/components/console-layout';
const byQuery: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'subset',
  matrixParams: 'ignored',
  fragment: 'ignored',
};
const SECTIONS = [
  { key: 'zones', label: 'Zones', icon: 'globe' },
  { key: 'workers', label: 'Workers', icon: 'bolt' },
  { key: 'logs', label: 'Logs', icon: 'list' },
];

@Component({
  selector: 'console-layout-router-example',
  imports: [TxConsoleLayout, TxPageHeader],
  template: `
    <div class="screen">
      <tx-console-layout
        title="Edge"
        titleMuted="console"
        logo="/favicon.svg"
        footerName="Edge console"
        [homeLink]="page"
        [crumbs]="crumbs()"
        [railItems]="railItems"
        [dt]="{ root: { minHeight: '100%', viewportHeight: '558px' } }"
      >
        <tx-page-header
          [title]="current()?.label ?? 'Edge'"
          [subtitle]="current() ? 'Opened from the address bar' : 'Pick a section in the rail'"
        />
      </tx-console-layout>
    </div>
  `,
  styles: `
    .screen {
      width: 100%;
      height: 560px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConsoleLayoutRouterExample {
  private readonly route = inject(ActivatedRoute);

  readonly page = page;
  readonly section = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('console'))),
    {
      initialValue: null,
    },
  );
  readonly current = computed(() => SECTIONS.find((item) => item.key === this.section()));
  readonly crumbs = computed(() => (this.current() ? [this.current()?.label ?? ''] : []));
  readonly railItems: TxConsoleRailItem[] = SECTIONS.map((item) => ({
    label: item.label,
    icon: item.icon,
    routerLink: page,
    queryParams: { console: item.key },
    activeOptions: byQuery,
  }));
}
