import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCodeDiff } from '@tectra-ng/code-editor';

@Component({
  selector: 'code-diff-side-by-side-example',
  imports: [TxCodeDiff],
  template: `
    <tx-code-diff
      view="split"
      language="json"
      [original]="before"
      [value]="after"
      readOnly
      height="300px"
    />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeDiffSideBySideExample {
  readonly before = `{
  "name": "weekly-report",
  "enabled": false,
  "schedule": { "day": "monday", "hour": 9 },
  "format": "pdf",
  "recipients": ["team@example.com"]
}`;
  readonly after = `{
  "name": "weekly-report",
  "enabled": true,
  "schedule": { "day": "friday", "hour": 16 },
  "recipients": [
    "team@example.com",
    "lead@example.com"
  ],
  "timezone": "UTC"
}`;
}
