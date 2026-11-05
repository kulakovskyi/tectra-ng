import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TOKEN_COLUMNS } from '../../../../data/doc-columns.data';
import { DocTable } from '../../../../doc-ui/doc-table/doc-table';
import { DocComponent } from '../../../../types/doc-component.interface';

@Component({
  selector: 'docs-theming-tab',
  imports: [DocTable],
  template: `
    <p class="hint">Each component reads its own variables, which fall back to the theme. Override them on any wrapper:</p>
    <pre class="code"><code>{{ overrideExample() }}</code></pre>
    <docs-table [title]="'Variables'" [columns]="tokenColumns" [rows]="doc().tokens" />
  `,
  styleUrl: '../../../page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemingTab {
  doc = input.required<DocComponent>();

  readonly tokenColumns = TOKEN_COLUMNS;
  overrideExample = computed(() => {
    const token = this.doc().tokens[0]?.name ?? '--tx-primary-base';
    return `.checkout ${this.doc().selector.split(',')[0]} {\n  ${token}: #0d9488;\n}`;
  });
}
