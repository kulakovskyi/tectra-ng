import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxExportPageSize, TxExportService } from '@tectra-ng/ui/export';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'export-rich-text-example',
  imports: [TxButton, TxSelectButton],
  template: `
    <article #article class="article">
      <h2>Release notes 2.4</h2>
      <p>
        This release brings <strong>faster search</strong>, <em>calmer notifications</em> and a new
        <code>export</code> command. Read the
        <a href="https://example.com/changelog">full changelog</a>
        for every detail.
      </p>
      <h3>What changed</h3>
      <ul>
        <li>
          Search
          <ul>
            <li>Results appear while you type</li>
            <li>Filters remember the last choice</li>
          </ul>
        </li>
        <li>Notifications are grouped by project</li>
        <li>Звіти та примітки зберігають кирилицю</li>
      </ul>
      <h3>How to update</h3>
      <ol>
        <li>Back up the workspace settings.</li>
        <li>Run the update and restart the app.</li>
      </ol>
      <pre><code>npm run export -- --format pdf --out notes.pdf</code></pre>
      <blockquote>Plans with more than ten members get the new search first.</blockquote>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Search</td>
            <td>1.8 s</td>
            <td>0.4 s</td>
          </tr>
          <tr>
            <td>Start-up</td>
            <td>3.1 s</td>
            <td>2.2 s</td>
          </tr>
          <tr>
            <td>Sync</td>
            <td>12 s</td>
            <td>7 s</td>
          </tr>
        </tbody>
      </table>
    </article>
    <div class="row">
      <tx-select-button
        ariaLabel="Page size"
        [options]="sizes"
        [allowEmpty]="false"
        [(value)]="pageSize"
      />
      <button txButton icon="file-pdf" [loading]="busy()" (click)="download()">Download PDF</button>
    </div>
  `,
  styles: `
    .article {
      padding: 16px 20px;
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-content-radius);
    }
    .article h2 {
      margin-top: 0;
    }
    .article table {
      border-collapse: collapse;
    }
    .article th,
    .article td {
      padding: 4px 12px;
      border: 1px solid var(--tx-surface-border);
      text-align: start;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-top: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportRichTextExample {
  private readonly exporter = inject(TxExportService);
  private readonly article = viewChild.required<ElementRef<HTMLElement>>('article');
  readonly pageSize = signal<TxExportPageSize>('a4');
  readonly busy = signal(false);
  readonly sizes = [
    { label: 'A4', value: 'a4' },
    { label: 'A5', value: 'a5' },
    { label: 'Letter', value: 'letter' },
  ];

  async download(): Promise<void> {
    this.busy.set(true);
    try {
      await this.exporter.exportHtmlPdf(this.article().nativeElement, {
        filename: 'release-notes',
        title: 'Release notes 2.4',
        pageSize: this.pageSize(),
      });
    } finally {
      this.busy.set(false);
    }
  }
}
