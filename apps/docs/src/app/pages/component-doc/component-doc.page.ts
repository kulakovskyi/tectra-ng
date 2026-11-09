import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxOverlayInset } from '@tectra-ng/core/overlay';
import { TxIcon } from '@tectra-ng/icons';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';
import { DocsClipboard } from '../../doc-ui/copy/clipboard.service';
import { DocsCopyIcon } from '../../doc-ui/copy/copy-icon';
import { DOC_TABS } from '../../data/doc-tabs.data';
import { DocComponent, DocTab } from '../../types/doc-component.interface';
import { A11yTab } from './tabs/a11y-tab/a11y-tab';
import { ApiTab } from './tabs/api-tab/api-tab';
import { FeaturesTab } from './tabs/features-tab/features-tab';
import { ThemingTab } from './tabs/theming-tab/theming-tab';

@Component({
  selector: 'docs-component-doc-page',
  imports: [FeaturesTab, ApiTab, ThemingTab, A11yTab, RouterLink, TxIcon, TxOverlayInset, TxTabs, DocsCopyIcon],
  templateUrl: './component-doc.page.html',
  styleUrl: './component-doc.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComponentDocPage {
  private readonly clipboard = inject(DocsClipboard);
  name = input.required<string>();

  readonly doc = input<DocComponent | null>(null);
  readonly docTabs = computed<TxTabItem[]>(() =>
    DOC_TABS.map((tab) => ({ value: tab.id, label: tab.label, badge: tab.id === 'features' ? this.doc()?.examples.length : undefined })),
  );
  importLine = computed(() => {
    const doc = this.doc();
    return doc ? `import { ${doc.importName} } from '${doc.importPath}';` : '';
  });
  activeTab = linkedSignal<string, DocTab>({ source: this.name, computation: () => 'features' });
  isImportCopied = signal(false);

  selectTab(value: TxTabValue): void {
    const tab = DOC_TABS.find((item) => item.id === value);
    if (tab) {
      this.activeTab.set(tab.id);
    }
  }

  copyImport(): void {
    this.clipboard.copy(this.importLine(), 'Import copied');
    this.isImportCopied.set(true);
    setTimeout(() => this.isImportCopied.set(false), 1600);
  }
}
