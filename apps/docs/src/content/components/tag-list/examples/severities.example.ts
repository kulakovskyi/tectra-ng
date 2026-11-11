import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTagList, TxTagListItem } from '@tectra-ng/ui/tag';

@Component({
  selector: 'tag-list-severities-example',
  imports: [TxTagList],
  template: ` <tx-tag-list [tags]="checks" [limit]="3" ariaLabel="Site checks" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagListSeveritiesExample {
  readonly checks: TxTagListItem[] = [
    { value: 'SSL', severity: 'success', icon: 'lock', tooltip: 'Certificate valid until March' },
    { value: 'DNS', severity: 'success', icon: 'check' },
    {
      value: 'Redirects',
      severity: 'warn',
      icon: 'exclamation-triangle',
      tooltip: '3 chains longer than two hops',
    },
    { value: 'Robots', severity: 'info', tooltip: 'Crawling allowed' },
    { value: 'Sitemap', severity: 'danger', icon: 'times', tooltip: 'Not found' },
  ];
}
