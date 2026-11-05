import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxOverlayInset } from '@tectra/core/overlay';
import { TxIcon } from '@tectra/icons';
import { DOC_COMPONENTS } from '../../../generated/registry';
import { DOC_TABS } from '../../data/doc-tabs.data';
import { DocTab } from '../../types/doc-component.interface';
import { A11yTab } from './tabs/a11y-tab/a11y-tab';
import { ApiTab } from './tabs/api-tab/api-tab';
import { FeaturesTab } from './tabs/features-tab/features-tab';
import { ThemingTab } from './tabs/theming-tab/theming-tab';

@Component({
  selector: 'docs-component-doc-page',
  imports: [FeaturesTab, ApiTab, ThemingTab, A11yTab, RouterLink, TxIcon, TxOverlayInset],
  templateUrl: './component-doc.page.html',
  styleUrl: './component-doc.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComponentDocPage {
  name = input.required<string>();

  readonly tabs = DOC_TABS;
  doc = computed(() => DOC_COMPONENTS.find((component) => component.name === this.name()) ?? null);
  importLine = computed(() => {
    const doc = this.doc();
    return doc ? `import { Tx${doc.title} } from '${doc.importPath}';` : '';
  });
  activeTab = linkedSignal<string, DocTab>({ source: this.name, computation: () => 'features' });
  isImportCopied = signal(false);

  copyImport(): void {
    navigator.clipboard?.writeText(this.importLine());
    this.isImportCopied.set(true);
    setTimeout(() => this.isImportCopied.set(false), 1600);
  }
}
