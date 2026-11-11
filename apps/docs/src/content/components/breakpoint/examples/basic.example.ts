import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxTag } from '@tectra-ng/ui/tag';
import { TxBreakpoints } from '@tectra-ng/utils/breakpoint';

@Component({
  selector: 'breakpoint-basic-example',
  imports: [TxTag],
  template: `
    <div class="flex">
      <tx-tag
        [value]="'Mobile: ' + (breakpoints.isMobile() ? 'yes' : 'no')"
        [severity]="breakpoints.isMobile() ? 'success' : 'secondary'"
      />
      <tx-tag
        [value]="'Tablet: ' + (breakpoints.isTablet() ? 'yes' : 'no')"
        [severity]="breakpoints.isTablet() ? 'success' : 'secondary'"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreakpointBasicExample {
  readonly breakpoints = inject(TxBreakpoints);
}
