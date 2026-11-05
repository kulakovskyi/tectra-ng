import { Directive, TemplateRef, inject } from '@angular/core';
import { TxProgressBarValueContext } from './progress-bar.types';

@Directive({ selector: 'ng-template[txProgressBarValue]' })
export class TxProgressBarValueTemplate {
  readonly templateRef = inject<TemplateRef<TxProgressBarValueContext>>(TemplateRef);
}
