import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxMenu, TxMenuItemTemplate } from '@tectra-ng/ui/menu';
import { TxPaginator } from '@tectra-ng/ui/paginator';
import { TxProgressSpinner } from '@tectra-ng/ui/progress-spinner';
import { TxRadioButton } from '@tectra-ng/ui/radio-button';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxTableColumnFilter } from './table-column-filter.component';
import { TxTableSettings } from './table-settings.component';

export const TX_TABLE_IMPORTS = [
  NgTemplateOutlet,
  FormsModule,
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  TxIcon,
  TxTooltip,
  TxSkeleton,
  TxButton,
  TxCheckbox,
  TxInput,
  TxInputNumber,
  TxSelect,
  TxRadioButton,
  TxPaginator,
  TxProgressSpinner,
  TxMenu,
  TxMenuItemTemplate,
  TxTableSettings,
  TxTableColumnFilter,
];
