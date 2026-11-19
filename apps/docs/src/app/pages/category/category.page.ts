import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxIcon } from '@tectra-ng/icons';
import { DOC_COMPONENTS } from '../../../generated/registry';
import { DOC_CATEGORIES, findCategory } from '../../data/categories.data';
import { DocCategory } from '../../types/category.interface';

interface CategoryView {
  eyebrow: string;
  heading: string;
  intro: string;
  groups: DocCategory[];
  current: DocCategory | null;
}

@Component({
  selector: 'docs-category-page',
  imports: [RouterLink, TxIcon],
  templateUrl: './category.page.html',
  styleUrls: ['../page.scss', './category.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CategoryPage {
  readonly category = input<string>();

  readonly categories = DOC_CATEGORIES;

  readonly view = computed<CategoryView | null>(() => {
    const slug = this.category();
    if (slug === undefined) {
      return {
        eyebrow: 'Components',
        heading: 'Angular components',
        intro: `All ${DOC_COMPONENTS.length} components of tectra, an open-source Angular UI kit: forms, data tables, charts, overlays, navigation, page blocks and utilities. Each one is a standalone component on signals, rendered on the server, themed by design tokens in light and dark mode, and usable from the keyboard and with screen readers.`,
        groups: DOC_CATEGORIES,
        current: null,
      };
    }
    const category = findCategory(slug);
    return category ? { eyebrow: 'Components', heading: category.heading, intro: category.intro, groups: [category], current: category } : null;
  });
}
