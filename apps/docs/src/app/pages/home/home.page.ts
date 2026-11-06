import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TxIcon } from '@tectra-ng/icons';
import { InkPreset, toCssVariables } from '@tectra-ng/themes';
import { TxBadge } from '@tectra-ng/ui/badge';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxToggleButton } from '@tectra-ng/ui/toggle-button';
import { DOC_COMPONENTS } from '../../../generated/registry';
import { HOME_FEATURES, HOME_MARQUEE_ICONS, HOME_ROLES, INSTALL_COMMAND } from '../../data/home.data';

@Component({
  selector: 'docs-home-page',
  imports: [RouterLink, ReactiveFormsModule, TxButton, TxInput, TxSelect, TxIcon, TxBadge, TxToggleButton],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {
  readonly features = HOME_FEATURES;
  readonly roles = HOME_ROLES;
  readonly marqueeIcons = [...HOME_MARQUEE_ICONS, ...HOME_MARQUEE_ICONS];
  readonly installCommand = INSTALL_COMMAND;
  readonly stats = [
    { value: DOC_COMPONENTS.length, label: 'components' },
    { value: 334, label: 'icons' },
    { value: toCssVariables(InkPreset.light).length + toCssVariables(InkPreset.components).length, label: 'design tokens' },
    { value: 5, label: 'accents' },
  ];

  role = new FormControl<string | null>('developer');
  isCopied = signal(false);
  isSaving = signal(false);

  copyInstall(): void {
    navigator.clipboard?.writeText(this.installCommand);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 1600);
  }

  save(): void {
    this.isSaving.set(true);
    setTimeout(() => this.isSaving.set(false), 1600);
  }
}
