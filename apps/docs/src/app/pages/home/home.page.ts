import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TX_ICONS, TxIcon } from '@tectra-ng/icons';
import { TxBadge } from '@tectra-ng/ui/badge';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxToggleButton } from '@tectra-ng/ui/toggle-button';
import { DOC_COMPONENTS } from '../../../generated/registry';
import { DocsCopyButton } from '../../doc-ui/copy/copy-button';
import { CodeBlock } from '../../doc-ui/code-block/code-block';
import { HOME_ROLES } from '../../data/home.data';
import { INTRO_PACKAGES, INTRO_PRINCIPLES, INTRO_START, INTRO_STEPS } from '../../data/intro.data';
import { CATEGORY_ICONS } from '../../data/navigation.data';

const CATEGORY_PREVIEW = 4;

@Component({
  selector: 'docs-home-page',
  imports: [RouterLink, ReactiveFormsModule, TxButton, TxInput, TxSelect, TxIcon, TxBadge, TxToggleButton, CodeBlock, DocsCopyButton],
  templateUrl: './home.page.html',
  styleUrls: ['../page.scss', './home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {
  readonly start = INTRO_START;
  readonly steps = INTRO_STEPS;
  readonly packages = INTRO_PACKAGES;
  readonly principles = INTRO_PRINCIPLES;
  readonly roles = HOME_ROLES;
  readonly componentCount = DOC_COMPONENTS.length;
  readonly iconCount = Object.keys(TX_ICONS).length;
  readonly categories = [...new Set(DOC_COMPONENTS.map((component) => component.category))]
    .map((category) => {
      const items = DOC_COMPONENTS.filter((component) => component.category === category);
      return {
        name: category,
        icon: CATEGORY_ICONS[category] ?? 'box',
        count: items.length,
        first: items[0].name,
        preview: items.slice(0, CATEGORY_PREVIEW).map((item) => ({ name: item.name, title: item.title })),
        more: Math.max(items.length - CATEGORY_PREVIEW, 0),
      };
    })
    .sort((a, b) => b.count - a.count);

  readonly role = new FormControl<string | null>('developer');
  readonly saving = signal(false);

  save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1600);
  }
}
