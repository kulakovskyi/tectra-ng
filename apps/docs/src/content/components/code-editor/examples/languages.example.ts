import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCodeEditor, TxCodeLanguage } from '@tectra-ng/code-editor';
import { TxSelect } from '@tectra-ng/ui/select';

const SAMPLES: Record<string, string> = {
  css: `/* Card */
.card {
  display: grid;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  color: #0f172a !important;
}

@media (max-width: 640px) {
  .card:hover > a { margin: 0 auto; }
}`,
  javascript: `import { fetchOrders } from './api.js';

export async function totals(customerId) {
  const orders = await fetchOrders({ customerId, limit: 50 });
  const paid = orders.filter((order) => order.status === 'paid');
  // Sum in cents to avoid rounding errors
  return paid.reduce((sum, order) => sum + order.amount * 100, 0) / 100;
}

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
console.log(\`Ready: \${slug('Spring Sale')}\`);`,
  typescript: `interface Order {
  readonly id: number;
  status: 'new' | 'paid' | 'refunded';
  amount: number;
}

export class OrderBook {
  private readonly orders = new Map<number, Order>();

  add(order: Order): void {
    this.orders.set(order.id, order);
  }

  get total(): number {
    return [...this.orders.values()].reduce((sum, order) => sum + order.amount, 0);
  }
}`,
  json: `{
  "name": "weekly-report",
  "enabled": true,
  "schedule": { "day": "monday", "hour": 9 },
  "recipients": ["team@example.com"],
  "threshold": 0.75,
  "lastRun": null
}`,
  markdown: `# Release notes

Version **2.4** brings a _faster_ search and \`dark\` mode.

- Search in all projects
- Export to [CSV](https://example.com/csv)

> Thanks to everyone who sent feedback.

\`\`\`json
{ "version": "2.4.0" }
\`\`\``,
  plain: `Plain text has no colours.
Indents, undo and search still work.`,
};

@Component({
  selector: 'code-editor-languages-example',
  imports: [TxCodeEditor, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <tx-select
        class="picker"
        [options]="languages"
        optionLabel="label"
        optionValue="value"
        [(ngModel)]="language"
        ariaLabel="Language"
      />
      <tx-code-editor [language]="language()" [value]="sample()" height="300px" />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .picker {
      width: 220px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeEditorLanguagesExample {
  readonly languages: { label: string; value: TxCodeLanguage }[] = [
    { label: 'CSS', value: 'css' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'JSON', value: 'json' },
    { label: 'Markdown', value: 'markdown' },
    { label: 'Plain text', value: 'plain' },
  ];
  readonly language = signal<TxCodeLanguage>('css');
  readonly sample = computed(() => SAMPLES[this.language()]);
}
